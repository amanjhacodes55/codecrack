#!/usr/bin/env python3
"""CodeCrack judge.

Reads a JSON job on stdin, compiles (if needed) and runs the program against each
test with CPU / wall-clock / memory / output-size limits, and prints a JSON result.

Job:
  {
    "language": "python" | "cpp" | "java",
    "code": "...",
    "tests": [{"input": "...", "output": "..." | null}],   # output null => just run (custom input)
    "timeLimitMs": 2000,
    "memoryMb": 256,
    "stopOnFirstFail": false
  }

Result:
  {
    "compile": {"ok": bool, "message": str},
    "results": [{"verdict": "AC|WA|TLE|MLE|RE|OLE|OK", "timeMs": int, "memoryKb": int,
                 "stdout": str, "stderr": str, "exitCode": int}],
  }
"""
import json
import os
import resource
import shutil
import signal
import subprocess
import sys
import tempfile
import threading
import time

OUTPUT_LIMIT = 8 * 1024 * 1024          # bytes a program may write to stdout
STDERR_LIMIT = 1 * 1024 * 1024
RETURN_LIMIT = 64 * 1024                 # bytes of stdout/stderr returned to the client
PY = sys.executable or "python3"

LANGUAGES = {
    "python": {
        "file": "main.py",
        "compile": None,
        "run": [PY, "-I", "-X", "utf8", "main.py"],
        "memory_overhead_mb": 0,
    },
    "cpp": {
        "file": "main.cpp",
        "compile": ["g++", "-O2", "-std=c++17", "-pipe", "-o", "main", "main.cpp"],
        "run": ["./main"],
        "memory_overhead_mb": 0,
    },
    "java": {
        "file": "Main.java",
        "compile": ["javac", "-encoding", "UTF-8", "Main.java"],
        "run": ["java", "-Xss64m", "-XX:+UseSerialGC", "-cp", ".", "Main"],
        "memory_overhead_mb": 1024,  # the JVM reserves a lot of virtual memory
    },
}


def normalize(s: str) -> str:
    lines = [ln.rstrip() for ln in s.replace("\r\n", "\n").split("\n")]
    while lines and lines[-1] == "":
        lines.pop()
    return "\n".join(lines)


def truncate(s: str, limit: int = RETURN_LIMIT) -> str:
    if len(s) <= limit:
        return s
    return s[:limit] + f"\n... [truncated {len(s) - limit} more characters]"


def user_process_count() -> int:
    uid = os.getuid()
    n = 0
    for pid in os.listdir("/proc"):
        if pid.isdigit():
            try:
                if os.stat(f"/proc/{pid}").st_uid == uid:
                    n += len(os.listdir(f"/proc/{pid}/task"))  # NPROC counts threads too
            except OSError:
                pass
    return n


# RLIMIT_NPROC counts *all* processes of this OS user, so allow only a few more than exist now.
# This stops fork bombs (a solution never needs more than a handful of processes/threads).
NPROC_LIMIT = user_process_count() + 48


def limiter(cpu_seconds: int, memory_bytes: int):
    def apply():
        os.setsid()
        resource.setrlimit(resource.RLIMIT_NPROC, (NPROC_LIMIT, NPROC_LIMIT))
        resource.setrlimit(resource.RLIMIT_CPU, (cpu_seconds, cpu_seconds + 1))
        if memory_bytes > 0:
            resource.setrlimit(resource.RLIMIT_AS, (memory_bytes, memory_bytes))
        resource.setrlimit(resource.RLIMIT_FSIZE, (OUTPUT_LIMIT, OUTPUT_LIMIT))
        resource.setrlimit(resource.RLIMIT_CORE, (0, 0))
        if os.geteuid() == 0:
            # Running as root (e.g. inside the app's Docker image): never run user code as root.
            # As "nobody" it cannot read the server's environment (/proc/<pid>/environ) or files.
            os.setgroups([])
            os.setgid(65534)
            os.setuid(65534)
    return apply


def run_one(cmd, cwd, stdin_text, time_limit_ms, memory_mb, env):
    wall_limit = time_limit_ms / 1000.0 * 2 + 1.0
    cpu_limit = max(1, int(time_limit_ms / 1000.0 + 0.999) + 1)
    in_path = os.path.join(cwd, ".stdin")
    out_path = os.path.join(cwd, ".stdout")
    err_path = os.path.join(cwd, ".stderr")
    with open(in_path, "w", encoding="utf-8") as f:
        f.write(stdin_text)

    timed_out = {"v": False}
    with open(in_path, "rb") as fin, open(out_path, "wb") as fout, open(err_path, "wb") as ferr:
        start = time.perf_counter()
        proc = subprocess.Popen(cmd, cwd=cwd, stdin=fin, stdout=fout, stderr=ferr, env=env,
                                preexec_fn=limiter(cpu_limit, memory_mb * 1024 * 1024))

        def kill():
            timed_out["v"] = True
            try:
                os.killpg(proc.pid, signal.SIGKILL)
            except ProcessLookupError:
                pass

        timer = threading.Timer(wall_limit, kill)
        timer.start()
        _, status, usage = os.wait4(proc.pid, 0)
        timer.cancel()
        proc.returncode = 0  # avoid ResourceWarning from Popen.__del__
        wall = time.perf_counter() - start

    cpu_ms = int((usage.ru_utime + usage.ru_stime) * 1000)
    mem_kb = int(usage.ru_maxrss)
    with open(out_path, "rb") as f:
        stdout = f.read(OUTPUT_LIMIT + 1).decode("utf-8", "replace")
    with open(err_path, "rb") as f:
        stderr = f.read(STDERR_LIMIT).decode("utf-8", "replace")

    exit_code = os.waitstatus_to_exitcode(status)
    signaled = os.WIFSIGNALED(status)
    sig = os.WTERMSIG(status) if signaled else 0

    verdict = "OK"
    time_ms = min(cpu_ms, int(wall * 1000)) if cpu_ms else int(wall * 1000)
    if timed_out["v"] or sig == signal.SIGXCPU or cpu_ms > time_limit_ms:
        verdict = "TLE"
        time_ms = max(time_ms, time_limit_ms)
    elif sig == signal.SIGXFSZ or len(stdout) > OUTPUT_LIMIT or "[Errno 27] File too large" in stderr:
        verdict = "OLE"
    elif "MemoryError" in stderr or "std::bad_alloc" in stderr or "OutOfMemoryError" in stderr:
        verdict = "MLE"
    elif exit_code != 0:
        verdict = "RE"

    return {
        "verdict": verdict,
        "timeMs": time_ms,
        "memoryKb": mem_kb,
        "stdout": stdout,
        "stderr": stderr,
        "exitCode": exit_code,
    }


def clean_stderr(stderr: str, workdir: str) -> str:
    # Hide the sandbox path from tracebacks so messages read like "main.py", line 3
    return stderr.replace(workdir + os.sep, "").replace(workdir, ".")


def main():
    job = json.load(sys.stdin)
    lang = LANGUAGES.get(job.get("language", "python"))
    if lang is None:
        print(json.dumps({"compile": {"ok": False, "message": "Unsupported language"}, "results": []}))
        return
    time_limit = int(job.get("timeLimitMs", 2000))
    memory_mb = int(job.get("memoryMb", 256)) + lang["memory_overhead_mb"]
    stop_on_fail = bool(job.get("stopOnFirstFail", False))

    workdir = tempfile.mkdtemp(prefix="cc-judge-")
    os.chmod(workdir, 0o777)  # user code may run as "nobody" (see limiter)
    env = {"PATH": "/usr/local/bin:/usr/bin:/bin", "HOME": workdir, "LANG": "C.UTF-8",
           "PYTHONDONTWRITEBYTECODE": "1", "PYTHONHASHSEED": "0"}
    try:
        with open(os.path.join(workdir, lang["file"]), "w", encoding="utf-8") as f:
            f.write(job["code"])

        compile_info = {"ok": True, "message": ""}
        if lang["compile"]:
            try:
                c = subprocess.run(lang["compile"], cwd=workdir, capture_output=True, text=True,
                                   timeout=30, env=env)
                if c.returncode != 0:
                    compile_info = {"ok": False, "message": truncate(clean_stderr(c.stderr or c.stdout, workdir))}
            except FileNotFoundError:
                compile_info = {"ok": False, "message": f"Compiler not installed on server: {lang['compile'][0]}"}
            except subprocess.TimeoutExpired:
                compile_info = {"ok": False, "message": "Compilation timed out"}
        elif job.get("language", "python") == "python":
            # Report syntax errors as a compile error, like a real judge would
            c = subprocess.run([PY, "-I", "-c", "import ast,sys; ast.parse(open('main.py',encoding='utf-8').read(),'main.py')"],
                               cwd=workdir, capture_output=True, text=True, timeout=10, env=env)
            if c.returncode != 0:
                msg = c.stderr
                # keep only the user-facing part of the traceback
                if "File \"main.py\"" in msg:
                    msg = msg[msg.index("File \"main.py\""):]
                compile_info = {"ok": False, "message": truncate(msg.strip())}

        results = []
        if compile_info["ok"]:
            for t in job.get("tests", []):
                r = run_one(lang["run"], workdir, t.get("input", ""), time_limit, memory_mb, env)
                r["stderr"] = clean_stderr(r["stderr"], workdir)
                expected = t.get("output")
                if r["verdict"] == "OK" and expected is not None:
                    r["verdict"] = "AC" if normalize(r["stdout"]) == normalize(expected) else "WA"
                r["stdout"] = truncate(r["stdout"])
                r["stderr"] = truncate(r["stderr"], 16 * 1024)
                results.append(r)
                if stop_on_fail and r["verdict"] not in ("AC", "OK"):
                    break
        print(json.dumps({"compile": compile_info, "results": results}))
    finally:
        shutil.rmtree(workdir, ignore_errors=True)


if __name__ == "__main__":
    main()

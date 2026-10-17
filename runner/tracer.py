#!/usr/bin/env python3
"""CodeCrack step debugger for Python.

Usage: python3 -I tracer.py <job.json> <result.json>

job.json:    {"code": "...", "input": "...", "maxSteps": 5000}
result.json: {
  "steps": [{"line": 3, "event": "line|call|return|exception", "func": "solve",
             "stack": [{"func": "<module>", "line": 10, "locals": {"x": {"t": "int", "v": "5"}}}, ...],
             "out": 12,                 # length of stdout produced so far
             "ret": {"t": ..., "v": ...} | null,   # on 'return' events
             "exc": "ValueError: boom" | null}],
  "stdout": "...", "error": {"line": 4, "message": "...", "traceback": "..."} | null,
  "truncated": bool
}
Each 'line' step shows the state *before* that line runs (the line about to execute).
"""
import io
import json
import os
import sys
import traceback
import types

FILENAME = "main.py"
MAX_REPR = 160
MAX_VARS = 60


class _StepLimit(BaseException):
    pass


def ser(v):
    t = type(v).__name__
    try:
        if isinstance(v, (types.FunctionType, types.BuiltinFunctionType)):
            return {"t": "function", "v": f"<function {v.__name__}>"}
        if isinstance(v, type):
            return {"t": "class", "v": f"<class {v.__name__}>"}
        r = repr(v)
    except Exception as e:  # noqa: BLE001
        r = f"<unrepresentable: {type(e).__name__}>"
    if len(r) > MAX_REPR:
        r = r[:MAX_REPR] + "…"
    out = {"t": t, "v": r}
    if isinstance(v, (list, tuple, dict, set, str, frozenset)):
        try:
            out["n"] = len(v)
        except Exception:  # noqa: BLE001
            pass
    return out


def frame_vars(frame):
    items = frame.f_locals.items()
    res = {}
    for k, v in items:
        if k.startswith("__") or isinstance(v, types.ModuleType):
            continue
        if frame.f_code.co_name == "<module>" and isinstance(v, (types.FunctionType, type)):
            continue
        res[k] = ser(v)
        if len(res) >= MAX_VARS:
            break
    return res


def main():
    job = json.load(open(sys.argv[1], encoding="utf-8"))
    result_file = open(sys.argv[2], "w", encoding="utf-8")  # opened before dropping privileges
    if os.geteuid() == 0:
        # Inside the app's Docker image the server runs as root: user code must not.
        os.setgroups([])
        os.setgid(65534)
        os.setuid(65534)
    for key in list(os.environ):
        if key not in ("PATH", "LANG", "HOME"):
            del os.environ[key]
    code = job["code"]
    max_steps = int(job.get("maxSteps", 5000))

    steps = []
    out_buf = io.StringIO()
    real_stdout = sys.stdout
    state = {"truncated": False}

    def snapshot(frame, event, arg):
        stack = []
        f = frame
        while f is not None:
            if f.f_code.co_filename == FILENAME:
                stack.append({"func": f.f_code.co_name, "line": f.f_lineno, "locals": frame_vars(f)})
            f = f.f_back
        stack.reverse()
        step = {"line": frame.f_lineno, "event": event, "func": frame.f_code.co_name,
                "stack": stack, "out": out_buf.tell(), "ret": None, "exc": None}
        if event == "return":
            step["ret"] = ser(arg)
        elif event == "exception":
            et, ev, _ = arg
            step["exc"] = f"{et.__name__}: {ev}"
        steps.append(step)
        if len(steps) >= max_steps:
            state["truncated"] = True
            raise _StepLimit()

    def tracer(frame, event, arg):
        if frame.f_code.co_filename != FILENAME:
            return None
        if event == "call" and frame.f_code.co_name == "<module>":
            return tracer
        if event in ("call", "line", "return", "exception"):
            snapshot(frame, event, arg)
        return tracer

    error = None
    try:
        compiled = compile(code, FILENAME, "exec")
    except SyntaxError as e:
        error = {"line": e.lineno or 1, "message": f"SyntaxError: {e.msg}",
                 "traceback": "".join(traceback.format_exception_only(type(e), e))}
        compiled = None

    if compiled is not None:
        g = {"__name__": "__main__", "__builtins__": __builtins__}
        sys.stdin = io.StringIO(job.get("input", ""))
        sys.stdout = out_buf
        sys.setrecursionlimit(3000)
        sys.settrace(tracer)
        try:
            exec(compiled, g)
        except _StepLimit:
            pass
        except SystemExit:
            pass
        except BaseException as e:  # noqa: BLE001
            sys.settrace(None)
            tb = traceback.extract_tb(e.__traceback__)
            user_frames = [fr for fr in tb if fr.filename == FILENAME]
            line = user_frames[-1].lineno if user_frames else None
            lines = ["Traceback (most recent call last):"]
            for fr in user_frames:
                lines.append(f'  File "{fr.filename}", line {fr.lineno}, in {fr.name}')
                src = code.splitlines()
                if fr.lineno and 0 < fr.lineno <= len(src):
                    lines.append(f"    {src[fr.lineno - 1].strip()}")
            lines.append(f"{type(e).__name__}: {e}")
            error = {"line": line, "message": f"{type(e).__name__}: {e}", "traceback": "\n".join(lines)}
        finally:
            sys.settrace(None)
            sys.stdout = real_stdout

    stdout = out_buf.getvalue()
    if len(stdout) > 200_000:
        stdout = stdout[:200_000]
    with result_file as f:
        json.dump({"steps": steps, "stdout": stdout, "error": error, "truncated": state["truncated"]}, f)


if __name__ == "__main__":
    main()

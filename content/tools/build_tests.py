#!/usr/bin/env python3
"""Build and verify test cases for CodeCrack problems.

Usage:
    python3 content/tools/build_tests.py <problem_dir> [<problem_dir> ...]
    python3 content/tools/build_tests.py --all

Each problem directory contains:
    problem.json   metadata + statement + samples (see content/FORMAT.md)
    solution.py    reference solution (reads stdin, writes stdout)
    gen.py         test generator:
                     EDGE_CASES: list[str]              hand-written inputs
                     NUM_RANDOM: int                    how many random cases
                     def random_case(rng, i) -> str     i = 0..NUM_RANDOM-1 (scale up with i)
                     def small_case(rng) -> str         (optional) tiny input for brute check
    brute.py       (optional) obviously-correct slow solution

The script:
  1. Runs solution.py on every sample and asserts the output matches problem.json.
  2. If brute.py + small_case exist, cross-checks solution vs brute on 300 small inputs.
  3. Generates tests.json = samples (visible) + edge + random (hidden) with outputs
     produced by solution.py, and reports the slowest reference runtime.
"""
import json
import os
import random
import subprocess
import sys
import time
import importlib.util

sys.dont_write_bytecode = True

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PROBLEMS = os.path.join(ROOT, "problems")
MAX_TESTS_BYTES = 4 * 1024 * 1024
REF_TIME_BUDGET = 1.0  # seconds; reference must be comfortably fast


def norm(s: str) -> str:
    lines = [ln.rstrip() for ln in s.replace("\r\n", "\n").split("\n")]
    while lines and lines[-1] == "":
        lines.pop()
    return "\n".join(lines)


def run(script: str, inp: str, timeout: float = 20.0):
    t0 = time.perf_counter()
    p = subprocess.run([sys.executable, "-I", script], input=inp, capture_output=True,
                       text=True, timeout=timeout)
    dt = time.perf_counter() - t0
    if p.returncode != 0:
        raise RuntimeError(f"{os.path.basename(script)} crashed:\n{p.stderr[-2000:]}\nINPUT (head): {inp[:300]!r}")
    return p.stdout, dt


def load_gen(path: str):
    spec = importlib.util.spec_from_file_location("gen_mod", path)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def build(pdir: str) -> bool:
    name = os.path.basename(os.path.normpath(pdir))
    meta = json.load(open(os.path.join(pdir, "problem.json")))
    sol = os.path.join(pdir, "solution.py")
    brute = os.path.join(pdir, "brute.py")
    gen = load_gen(os.path.join(pdir, "gen.py"))
    assert meta.get("slug") == name, f"slug {meta.get('slug')!r} != dir name {name!r}"
    for key in ("title", "difficulty", "statement", "inputFormat", "outputFormat", "constraints", "samples", "starter"):
        assert key in meta, f"problem.json missing '{key}'"
    assert meta["difficulty"] in ("Easy", "Medium", "Hard"), "difficulty must be Easy|Medium|Hard"
    assert "python" in meta["starter"], "starter.python required"

    # 1. samples
    for k, s in enumerate(meta["samples"]):
        out, _ = run(sol, s["input"])
        if norm(out) != norm(s["output"]):
            print(f"[FAIL] {name}: sample {k} mismatch\n expected: {s['output']!r}\n got:      {out!r}")
            return False

    # 1b. starter code must at least run (not crash with SyntaxError) on sample 0
    starter_path = os.path.join(pdir, ".starter_check.py")
    with open(starter_path, "w") as f:
        f.write(meta["starter"]["python"])
    p = subprocess.run([sys.executable, "-I", starter_path], input=meta["samples"][0]["input"],
                       capture_output=True, text=True, timeout=10)
    os.remove(starter_path)
    if "SyntaxError" in p.stderr or "IndentationError" in p.stderr:
        print(f"[FAIL] {name}: starter code has a syntax error:\n{p.stderr[-800:]}")
        return False

    # 2. brute cross-check
    if os.path.exists(brute) and hasattr(gen, "small_case"):
        rng = random.Random(12345)
        for k in range(300):
            inp = gen.small_case(rng)
            a, _ = run(sol, inp)
            b, _ = run(brute, inp)
            if norm(a) != norm(b):
                print(f"[FAIL] {name}: solution != brute on small case {k}\nINPUT:\n{inp}\nsolution: {a!r}\nbrute:    {b!r}")
                return False

    # 3. tests
    tests = []
    worst = 0.0
    for s in meta["samples"]:
        tests.append({"input": s["input"], "output": norm(s["output"]) + "\n", "sample": True})
    inputs = list(getattr(gen, "EDGE_CASES", []))
    rng = random.Random(2026)
    for i in range(getattr(gen, "NUM_RANDOM", 10)):
        inputs.append(gen.random_case(rng, i))
    seen = {t["input"] for t in tests}
    for inp in inputs:
        if not inp.endswith("\n"):
            inp += "\n"
        if inp in seen:
            continue
        seen.add(inp)
        out, dt = run(sol, inp)
        worst = max(worst, dt)
        tests.append({"input": inp, "output": norm(out) + "\n", "sample": False})

    blob = json.dumps(tests)
    if len(blob) > MAX_TESTS_BYTES:
        print(f"[FAIL] {name}: tests.json is {len(blob)/1e6:.1f} MB (> 4 MB). Shrink the largest cases.")
        return False
    if len(tests) < 8:
        print(f"[FAIL] {name}: only {len(tests)} tests; need at least 8.")
        return False
    with open(os.path.join(pdir, "tests.json"), "w") as f:
        f.write(blob)
    warn = "  (WARNING: reference is slow, keep it < 1s)" if worst > REF_TIME_BUDGET else ""
    print(f"[ OK ] {name}: {len(tests)} tests, {len(blob)/1e3:.0f} KB, slowest ref {worst*1000:.0f} ms{warn}")
    return True


def main():
    args = sys.argv[1:]
    if not args:
        print(__doc__)
        sys.exit(1)
    dirs = sorted(os.path.join(PROBLEMS, d) for d in os.listdir(PROBLEMS)) if args == ["--all"] else args
    ok = True
    for d in dirs:
        if not os.path.isfile(os.path.join(d, "problem.json")):
            continue
        try:
            ok &= build(d)
        except Exception as e:  # noqa: BLE001
            print(f"[FAIL] {os.path.basename(d)}: {e}")
            ok = False
    sys.exit(0 if ok else 1)


if __name__ == "__main__":
    main()

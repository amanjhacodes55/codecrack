EDGE_CASES = [
    "1\n-10\n",
    "1\n0\n",
    "2\n-10 -9\n",
    "21\n" + " ".join(str(x) for x in range(-10, 11)) + "\n",
    "20\n" + " ".join(str(x) for x in range(-10, 10) if x != 0) + " 10\n",
    "5\n10 10 10 10 10\n",
    "6\n5 4 3 2 1 0\n",
]
NUM_RANDOM = 16

def _run_array(rng, n):
    a = []
    while len(a) < n:
        L = rng.randint(1, 21)
        run = sorted(rng.sample(range(-10, 11), L))
        a.extend(run)
    return a[:n]

def random_case(rng, i):
    n = [5, 50, 500, 5000, 20000][min(i // 3, 4)]
    if i >= NUM_RANDOM - 2: n = 200000
    if i % 2 == 0:
        a = _run_array(rng, n)
    else:
        a = [rng.randint(-10, 10) for _ in range(n)]
    return f"{n}\n{' '.join(map(str, a))}\n"

def small_case(rng):
    n = rng.randint(1, 10)
    a = _run_array(rng, n) if rng.random() < 0.6 else [rng.randint(-4, 4) for _ in range(n)]
    return f"{n}\n{' '.join(map(str, a))}\n"

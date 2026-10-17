EDGE_CASES = [
    "1\n7\n",
    "2\n1 2\n",
    "2\n5 5\n",
    "4\n1 1 2 2\n",
    "5\n-3 -3 -3 4 4\n",
    "6\n9 9 9 1 2 3\n",
]
NUM_RANDOM = 14

def _make(rng, n, lo, hi):
    if rng.random() < 0.5:
        maj = rng.randint(lo, hi)
        k = n // 2 + 1 + rng.randint(0, max(0, n // 4))
        k = min(k, n)
        a = [maj] * k + [rng.randint(lo, hi) for _ in range(n - k)]
    else:
        a = [rng.randint(lo, hi) for _ in range(n)]
    rng.shuffle(a)
    return f"{n}\n{' '.join(map(str, a))}\n"

def random_case(rng, i):
    n = [10, 100, 1000, 10**4, 10**5][min(i // 3, 4)]
    return _make(rng, n, -10**9, 10**9) if i % 2 else _make(rng, n, 1, 3)

def small_case(rng):
    return _make(rng, rng.randint(1, 8), 1, 3)

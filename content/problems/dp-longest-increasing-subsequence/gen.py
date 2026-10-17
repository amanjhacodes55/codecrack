EDGE_CASES = [
    "1\n42\n",
    "5\n7 7 7 7 7\n",
    "6\n6 5 4 3 2 1\n",
    "6\n1 2 3 4 5 6\n",
    "8\n-5 3 -2 3 4 -1 5 5\n",
    "4\n-1000000000 1000000000 0 1\n",
]
NUM_RANDOM = 14


def _make(rng, n, lo, hi):
    a = [rng.randint(lo, hi) for _ in range(n)]
    return f"{n}\n{' '.join(map(str, a))}\n"


def random_case(rng, i):
    n = [10, 100, 1000, 10**4][min(i // 3, 3)]
    if i >= NUM_RANDOM - 2:
        n = 10**5
    if i == NUM_RANDOM - 1:  # long increasing trend with noise
        a = [j * 3 + rng.randint(-50, 50) for j in range(n)]
        return f"{n}\n{' '.join(map(str, a))}\n"
    return _make(rng, n, -10**9, 10**9) if i % 2 else _make(rng, n, 1, max(2, n // 3))


def small_case(rng):
    return _make(rng, rng.randint(1, 11), -5, 5)

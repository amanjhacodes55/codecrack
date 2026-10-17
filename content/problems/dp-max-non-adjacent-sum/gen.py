EDGE_CASES = [
    "1\n5\n",
    "1\n-5\n",
    "2\n3 3\n",
    "3\n-1 -2 -3\n",
    "5\n10 1 1 10 1\n",
    "6\n0 0 0 0 0 0\n",
    "4\n1000000000 1000000000 1000000000 1000000000\n",
]
NUM_RANDOM = 14


def _make(rng, n, lo, hi):
    a = [rng.randint(lo, hi) for _ in range(n)]
    return f"{n}\n{' '.join(map(str, a))}\n"


def random_case(rng, i):
    n = [10, 100, 1000, 5000][min(i // 3, 3)]
    if i >= NUM_RANDOM - 2:
        n = 10**5
    if i % 3 == 0:
        return _make(rng, n, 0, 10**9)
    if i % 3 == 1:
        return _make(rng, n, -10**9, 10**9)
    return _make(rng, n, -10, 10)


def small_case(rng):
    return _make(rng, rng.randint(1, 12), -10, 10)

EDGE_CASES = [
    "1 1\n7\n",
    "3 3\n4 9 2\n",
    "3 1\n4 9 2\n",
    "5 2\n1 1 1 1 1\n",
    "4 2\n10000 1 1 10000\n",
    "6 4\n10000 10000 10000 10000 10000 10000\n",
]
NUM_RANDOM = 14


def _make(rng, n, k, hi):
    a = [rng.randint(1, hi) for _ in range(n)]
    return f"{n} {k}\n{' '.join(map(str, a))}\n"


def random_case(rng, i):
    n = [10, 100, 1000, 10**4, 10**5][min(i // 3, 4)]
    k = rng.choice([1, 2, rng.randint(1, n), max(1, n // 3), n])
    hi = [10, 10**4, 100][i % 3]
    return _make(rng, n, k, hi)


def small_case(rng):
    n = rng.randint(1, 8)
    return _make(rng, n, rng.randint(1, n), rng.choice([3, 10, 50]))

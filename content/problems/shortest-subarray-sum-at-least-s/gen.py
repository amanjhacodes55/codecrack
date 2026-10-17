EDGE_CASES = [
    "1 5\n5\n",
    "1 6\n5\n",
    "3 1\n1 1 1\n",
    "3 4\n1 1 1\n",
    "4 10\n1 2 3 4\n",
    "5 10000\n1 1 10000 1 1\n",
    "6 1000000000\n10000 10000 10000 10000 10000 10000\n",
]
NUM_RANDOM = 14


def _make(rng, n, hi, s):
    a = [rng.randint(1, hi) for _ in range(n)]
    return f"{n} {s}\n{' '.join(map(str, a))}\n"


def random_case(rng, i):
    n = [10, 100, 1000, 10**4, 10**5][min(i // 3, 4)]
    hi = [10, 10**4, 100][i % 3]
    total_est = n * (hi + 1) // 2
    s = rng.choice([rng.randint(1, max(1, total_est // 20)), rng.randint(1, max(1, total_est)), total_est + 10**5])
    return _make(rng, n, hi, s)


def small_case(rng):
    n = rng.randint(1, 10)
    return _make(rng, n, 6, rng.randint(1, 30))

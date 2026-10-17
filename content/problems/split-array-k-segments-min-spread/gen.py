EDGE_CASES = [
    "1 1\n5\n",
    "3 3\n1 100 7\n",
    "5 1\n4 9 1 7 3\n",
    "6 2\n5 5 5 5 5 5\n",
    "6 3\n1 2 3 100 101 102\n",
    "4 2\n1000000000 0 1000000000 0\n",
]
NUM_RANDOM = 14


def _make(rng, n, k, hi):
    a = [rng.randint(0, hi) for _ in range(n)]
    return f"{n} {k}\n{' '.join(map(str, a))}\n"


def random_case(rng, i):
    n = [8, 30, 100, 250][min(i // 3, 3)]
    if i >= NUM_RANDOM - 3:
        n = 250
    k = rng.randint(1, min(n, 25))
    if i >= NUM_RANDOM - 2:
        k = 25
    hi = [10, 1000, 10**9][i % 3]
    return _make(rng, n, k, hi)


def small_case(rng):
    n = rng.randint(1, 9)
    return _make(rng, n, rng.randint(1, n), rng.choice([5, 20, 100]))

EDGE_CASES = [
    "1 1\n1\n",
    "1 2\n1\n",
    "1 3\n1\n",
    "2 10\n1 2\n",
    "3 7\n10 20 30\n",
    "4 12\n3 3 3 3\n",
    "5 10000\n10000 1 5000 2500 9999\n",
]
NUM_RANDOM = 14


def _make(rng, n, e, amax):
    a = [rng.randint(1, amax) for _ in range(n)]
    return f"{n} {e}\n{' '.join(map(str, a))}\n"


def random_case(rng, i):
    n = [5, 20, 60, 100][min(i // 4, 3)]
    e = [30, 1000, 5000, 10**4][min(i // 4, 3)]
    if i >= NUM_RANDOM - 3:
        n, e = 100, 10**4
    amax = [e, max(1, e // 10), 50][i % 3]
    return _make(rng, n, rng.randint(e // 2, e), amax)


def small_case(rng):
    n = rng.randint(1, 8)
    return _make(rng, n, rng.randint(1, 30), 12)

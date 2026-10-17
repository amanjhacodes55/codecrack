EDGE_CASES = [
    "1 1\n1\n5\n",
    "1 4\n5\n100\n",
    "3 0\n1 2 3\n10 20 30\n",
    "4 10\n10 10 10 10\n1 2 3 4\n",
    "3 6\n3 3 4\n5 5 9\n",
    "5 10000\n2000 2000 2000 2000 2000\n1000000000 1000000000 1000000000 1000000000 1000000000\n",
]
NUM_RANDOM = 14


def _make(rng, n, cap, wmax, vmax):
    w = [rng.randint(1, wmax) for _ in range(n)]
    v = [rng.randint(1, vmax) for _ in range(n)]
    return f"{n} {cap}\n{' '.join(map(str, w))}\n{' '.join(map(str, v))}\n"


def random_case(rng, i):
    n = [5, 20, 50, 100][min(i // 4, 3)]
    cap = [20, 500, 3000, 10**4][min(i // 4, 3)]
    if i >= NUM_RANDOM - 3:
        n, cap = 100, 10**4
    wmax = cap if i % 2 else max(1, cap // 5)
    return _make(rng, n, cap, wmax, 10**9 if i % 3 == 0 else 1000)


def small_case(rng):
    n = rng.randint(1, 10)
    return _make(rng, n, rng.randint(0, 25), 10, 20)

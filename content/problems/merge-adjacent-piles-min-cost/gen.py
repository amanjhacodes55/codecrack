EDGE_CASES = [
    "1\n7\n",
    "2\n3 4\n",
    "3\n0 0 0\n",
    "5\n1 1 1 1 1\n",
    "4\n1000000000 1 1 1000000000\n",
    "6\n1 100 1 100 1 100\n",
]
NUM_RANDOM = 12


def _make(rng, n, hi):
    a = [rng.randint(0, hi) for _ in range(n)]
    return f"{n}\n{' '.join(map(str, a))}\n"


def random_case(rng, i):
    n = [6, 20, 60, 120, 200][min(i // 3, 4)]
    if i >= NUM_RANDOM - 2:
        n = 200
    return _make(rng, n, [10, 1000, 10**9][i % 3])


def small_case(rng):
    return _make(rng, rng.randint(1, 7), rng.choice([5, 50]))

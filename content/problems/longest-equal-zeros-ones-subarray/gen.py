EDGE_CASES = [
    "1\n0\n",
    "1\n1\n",
    "2\n0 1\n",
    "2\n1 1\n",
    "4\n0 0 1 1\n",
    "6\n1 1 1 1 1 0\n",
    "8\n0 1 0 1 0 1 0 1\n",
    "5\n0 0 0 0 0\n",
]
NUM_RANDOM = 14


def _make(rng, n, p):
    a = [1 if rng.random() < p else 0 for _ in range(n)]
    return f"{n}\n{' '.join(map(str, a))}\n"


def random_case(rng, i):
    n = [10, 100, 1000, 10**4, 10**5][min(i // 3, 4)]
    p = [0.5, 0.3, 0.8][i % 3]
    if i == 13:  # max size, all ones except one zero at the end
        a = [1] * (n - 1) + [0]
        return f"{n}\n{' '.join(map(str, a))}\n"
    return _make(rng, n, p)


def small_case(rng):
    return _make(rng, rng.randint(1, 12), rng.choice([0.2, 0.5, 0.8]))

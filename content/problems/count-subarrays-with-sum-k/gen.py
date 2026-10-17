EDGE_CASES = [
    "1 5\n5\n",
    "1 0\n0\n",
    "1 3\n-3\n",
    "3 2\n1 1 1\n",
    "5 0\n0 0 0 0 0\n",
    "4 0\n1 -1 1 -1\n",
    "3 -10000\n-10000 10000 -10000\n",
    "6 6\n1 2 3 -3 3 3\n",
]
NUM_RANDOM = 14


def _make(rng, n, lo, hi):
    a = [rng.randint(lo, hi) for _ in range(n)]
    if rng.random() < 0.7:
        i = rng.randrange(n)
        j = rng.randrange(i, min(n, i + 20))
        k = sum(a[i:j + 1])
    else:
        k = rng.randint(lo * 3, hi * 3)
    return f"{n} {k}\n{' '.join(map(str, a))}\n"


def random_case(rng, i):
    n = [10, 100, 1000, 10**4, 10**5][min(i // 3, 4)]
    if i == 13:  # all zeros, K = 0 -> n(n+1)/2
        return f"{n} 0\n{' '.join(['0'] * n)}\n"
    if i % 3 == 0:
        return _make(rng, n, -10**4, 10**4)
    if i % 3 == 1:
        return _make(rng, n, -2, 2)
    return _make(rng, n, 0, 5)


def small_case(rng):
    return _make(rng, rng.randint(1, 10), -3, 3)

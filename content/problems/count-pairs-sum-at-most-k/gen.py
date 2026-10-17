EDGE_CASES = [
    "1 100\n5\n",
    "2 2\n1 1\n",
    "2 1\n1 1\n",
    "4 -1\n-1 0 0 1\n",
    "5 -2000000000\n-1000000000 -1000000000 -1000000000 5 6\n",
    "3 2000000000\n1000000000 1000000000 1000000000\n",
    "6 0\n3 3 3 3 3 3\n",
]
NUM_RANDOM = 14


def _make(rng, n, lo, hi):
    a = [rng.randint(lo, hi) for _ in range(n)]
    s = sorted(a)
    k = rng.choice([s[0] + s[-1], s[len(s) // 2] * 2, rng.randint(2 * lo, 2 * hi)])
    return f"{n} {k}\n{' '.join(map(str, a))}\n"


def random_case(rng, i):
    n = [10, 100, 1000, 10**4, 10**5][min(i // 3, 4)]
    if i % 2:
        return _make(rng, n, -10**9, 10**9)
    return _make(rng, n, -20, 20)


def small_case(rng):
    return _make(rng, rng.randint(1, 10), -5, 5)

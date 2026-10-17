EDGE_CASES = [
    "1 2\n1\n",
    "2 2\n1 1\n",
    "2 3\n1 1\n",
    "5 6\n3 3 3 3 3\n",
    "4 0\n-5 5 0 0\n",
    "3 -2000000000\n-1000000000 -1000000000 7\n",
    "3 2000000000\n1000000000 1000000000 1000000000\n",
    "6 7\n1 2 3 4 5 6\n",
]
NUM_RANDOM = 14


def _make(rng, n, lo, hi):
    a = [rng.randint(lo, hi) for _ in range(n)]
    if rng.random() < 0.7 and n >= 2:
        i, j = rng.sample(range(n), 2)
        k = a[i] + a[j]
    else:
        k = rng.randint(2 * lo, 2 * hi)
    return f"{n} {k}\n{' '.join(map(str, a))}\n"


def random_case(rng, i):
    n = [10, 100, 1000, 10**4, 10**5][min(i // 3, 4)]
    if i == 13:  # all equal -> answer n*(n-1)/2
        return f"{n} 10\n{' '.join(['5'] * n)}\n"
    if i % 2:
        return _make(rng, n, -10**9, 10**9)
    return _make(rng, n, -10, 10)


def small_case(rng):
    return _make(rng, rng.randint(1, 10), -4, 4)

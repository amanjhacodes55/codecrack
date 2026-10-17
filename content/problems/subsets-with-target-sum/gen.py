EDGE_CASES = [
    "1 5\n5\n",
    "1 4\n5\n",
    "3 6\n1 2 3\n",
    "4 100\n1 2 3 4\n",
    "15 120\n1 2 3 4 5 6 7 8 9 10 11 12 13 14 15\n",
    "5 7\n7 1 6 2 5\n",
]
NUM_RANDOM = 14


def _make(rng, n, hi, t=None):
    a = rng.sample(range(1, hi + 1), n)
    if t is None:
        if rng.random() < 0.8:
            sub = [x for x in a if rng.random() < 0.5] or [a[0]]
            t = sum(sub)
        else:
            t = rng.randint(1, sum(a))
    rng.shuffle(a)
    return f"{n} {t}\n{' '.join(map(str, a))}\n"


def random_case(rng, i):
    n = [4, 8, 10, 12, 15][min(i // 3, 4)]
    hi = [n + 5, 30, 100][i % 3]
    if i == 13:  # dense: 1..15 with a mid-range target -> many subsets
        return _make(rng, 15, 15, 60)
    return _make(rng, n, hi)


def small_case(rng):
    n = rng.randint(1, 8)
    return _make(rng, n, rng.choice([n, 12, 30]))

EDGE_CASES = [
    "1 1\n5\n1 1\n",
    "1 2\n-1000000000\n1 1\n1 1\n",
    "3 3\n1 2 3\n1 3\n2 2\n3 3\n",
    "4 2\n1000000000 1000000000 1000000000 1000000000\n1 4\n2 3\n",
    "5 3\n-1 1 -1 1 -1\n1 5\n2 5\n1 2\n",
]
NUM_RANDOM = 12


def _make(rng, n, q, lo, hi):
    a = [rng.randint(lo, hi) for _ in range(n)]
    lines = [f"{n} {q}", " ".join(map(str, a))]
    for _ in range(q):
        l = rng.randint(1, n)
        r = rng.randint(l, n)
        lines.append(f"{l} {r}")
    return "\n".join(lines) + "\n"


def random_case(rng, i):
    n = [10, 100, 1000, 10**4, 10**5][min(i // 3, 4)]
    q = n
    if i % 2:
        return _make(rng, n, q, -10**9, 10**9)
    return _make(rng, n, q, -100, 100)


def small_case(rng):
    n = rng.randint(1, 8)
    return _make(rng, n, rng.randint(1, 6), -5, 5)

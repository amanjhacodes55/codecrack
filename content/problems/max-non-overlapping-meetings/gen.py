EDGE_CASES = [
    "1\n0 1\n",
    "2\n1 3\n3 5\n",
    "2\n1 3\n2 5\n",
    "3\n0 1000000000\n0 1\n1 2\n",
    "4\n5 6\n5 6\n5 6\n5 6\n",
    "5\n1 10\n2 3\n4 5\n6 7\n8 9\n",
]
NUM_RANDOM = 14


def _make(rng, n, T, maxlen):
    lines = [str(n)]
    for _ in range(n):
        s = rng.randint(0, T - 1)
        e = min(T, s + rng.randint(1, maxlen))
        lines.append(f"{s} {e}")
    return "\n".join(lines) + "\n"


def random_case(rng, i):
    n = [10, 100, 1000, 10**4, 3 * 10**4][min(i // 3, 4)]
    if i == 13:  # one test at the maximum N, small coordinates
        return _make(rng, 10**5, 2 * 10**5, 10)
    if i % 2:
        return _make(rng, n, 10**9, 10**9 // max(1, n // 10))
    return _make(rng, n, 2 * n, 10)


def small_case(rng):
    return _make(rng, rng.randint(1, 9), 12, 5)

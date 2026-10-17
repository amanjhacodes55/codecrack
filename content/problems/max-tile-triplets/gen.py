EDGE_CASES = [
    "1 1\n1\n",
    "3 1\n1 1 1\n",
    "3 3\n1 2 3\n",
    "6 3\n1 1 2 2 3 3\n",
    "2 5\n2 4\n",
    "9 5\n1 2 2 2 3 3 3 4 5\n",
]
NUM_RANDOM = 14

def _case(rng, n, m, spread):
    base = rng.randint(1, m)
    a = [min(m, max(1, base + rng.randint(-spread, spread))) for _ in range(n)]
    return f"{n} {m}\n{' '.join(map(str, a))}\n"

def random_case(rng, i):
    if i == NUM_RANDOM - 1:
        return _case(rng, 10**5, 10**4, 10**4)
    if i == NUM_RANDOM - 2:
        n, m = 10**5, 10**4
        a = [rng.randint(1, m) for _ in range(n)]
        return f"{n} {m}\n{' '.join(map(str, a))}\n"
    n = rng.randint(1, [10, 100, 1000, 10**4, 5 * 10**4][min(i // 3, 4)])
    m = rng.choice([5, 50, 10**4])
    return _case(rng, n, m, rng.choice([2, 5, m]))

def small_case(rng):
    n = rng.randint(1, 10)
    m = rng.randint(1, 6)
    return _case(rng, n, m, m)

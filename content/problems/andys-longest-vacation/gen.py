EDGE_CASES = [
    "1 0 0\n\n",
    "1 1 0\n1\n",
    "1 1 1\n1\n",
    "5 5 0\n1 2 3 4 5\n",
    "5 3 2\n3 3 3\n",
    "5 3 3\n3 3 3\n",
    "6 2 0\n1 6\n",
    "8 4 100\n1 2 7 8\n",
]
NUM_RANDOM = 16

def _make(rng, n, m, k):
    if rng.random() < 0.4:
        hot = [rng.randint(1, n) for _ in range(max(1, n // 10))]
        days = [rng.choice(hot) for _ in range(m)]
    else:
        days = [rng.randint(1, n) for _ in range(m)]
    return f"{n} {m} {k}\n{' '.join(map(str, days))}\n"

def random_case(rng, i):
    n = [10, 100, 1000, 10**4, 30000][min(i // 3, 4)]
    if i >= NUM_RANDOM - 2: n = 200000
    m = n if i == NUM_RANDOM - 1 else (n // 4 if i == NUM_RANDOM - 2 else rng.randint(0, n))
    k = rng.randint(0, max(1, m // 5))
    return _make(rng, n, m, k)

def small_case(rng):
    n = rng.randint(1, 10)
    m = rng.randint(0, 8)
    return _make(rng, n, m, rng.randint(0, 4))

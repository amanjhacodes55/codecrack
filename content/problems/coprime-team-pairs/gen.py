EDGE_CASES = [
    "1\n1\n",
    "2\n1 1\n",
    "2\n2 4\n",
    "3\n2 3 4\n",
    "4\n6 10 15 7\n",
    "5\n200000 200000 199999 1 2\n",
]
NUM_RANDOM = 12

def _case(rng, n, vmax, mode):
    if mode == 0:
        a = [rng.randint(1, vmax) for _ in range(n)]
    elif mode == 1:  # mostly even numbers / shared factors
        a = [rng.choice([2, 3, 6, 5]) * rng.randint(1, max(1, vmax // 6)) for _ in range(n)]
    else:  # few distinct values
        pool = [rng.randint(1, vmax) for _ in range(5)]
        a = [rng.choice(pool) for _ in range(n)]
    return f"{n}\n{' '.join(map(str, a))}\n"

def random_case(rng, i):
    if i >= NUM_RANDOM - 2:
        return _case(rng, 100000, 200000, 0 if i == NUM_RANDOM - 1 else 1)
    n = rng.randint(1, [10, 100, 1000, 10000, 50000][min(i // 2, 4)])
    return _case(rng, n, rng.choice([10, 1000, 200000]), i % 3)

def small_case(rng):
    return _case(rng, rng.randint(1, 15), rng.choice([6, 30, 100]), rng.randint(0, 2))

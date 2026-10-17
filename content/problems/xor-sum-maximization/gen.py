EDGE_CASES = [
    "1 0\n0\n",
    "1 0\n7\n",
    "1 1000000000\n0\n",
    "2 5\n3 3\n",
    "4 7\n1 2 4 7\n",
    "3 1000000000\n1000000000 1000000000 1000000000\n",
    "2 8\n5 2\n",
]
NUM_RANDOM = 14

def _case(rng, n, kmax, amax):
    k = rng.randint(0, kmax)
    a = [rng.randint(0, amax) for _ in range(n)]
    return f"{n} {k}\n{' '.join(map(str, a))}\n"

def random_case(rng, i):
    n = [5, 50, 500, 5000, 10**5][min(i // 3, 4)]
    if i >= NUM_RANDOM - 2:
        n = 10**5
    return _case(rng, n, rng.choice([10**9, 2**rng.randint(1, 29), 1000]), rng.choice([10**9, 15, 2**20]))

def small_case(rng):
    n = rng.randint(1, 6)
    return _case(rng, n, rng.choice([1, 7, 16, 100, 255]), rng.choice([3, 15, 255]))

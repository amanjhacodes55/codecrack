EDGE_CASES = [
    "1 1 0\n0\n5\n",
    "1 1 0\n1\n5\n",
    "3 0 7\n1 2 3\n10 10 10\n",
    "3 3 1\n1 2 4\n1 1 100\n",
    "4 2 5\n5 5 5 6\n0 0 1 100\n",
]
NUM_RANDOM = 12

def _case(rng, n, k, p, rmax, gmax):
    req = [rng.randint(0, rmax) if rng.random() < 0.9 else rng.randint(0, 5) for _ in range(n)]
    gain = [rng.randint(0, gmax) for _ in range(n)]
    return f"{n} {k} {p}\n{' '.join(map(str, req))}\n{' '.join(map(str, gain))}\n"

def random_case(rng, i):
    if i >= NUM_RANDOM - 2:
        n = 100000 if i == NUM_RANDOM - 1 else 40000
        return _case(rng, n, n if i == NUM_RANDOM - 1 else n // 2, 10**5, 10**8, 10**4)
    n = rng.randint(1, [8, 100, 1000, 5000, 15000][min(i // 2, 4)])
    gmax = rng.choice([5, 1000, 10**9])
    return _case(rng, n, rng.randint(0, n), rng.randint(0, 10), rng.choice([gmax * 3, n * gmax // 4 + 1]), gmax)

def small_case(rng):
    n = rng.randint(1, 6)
    return _case(rng, n, rng.randint(0, n), rng.randint(0, 3), rng.choice([5, 15]), rng.choice([3, 6]))

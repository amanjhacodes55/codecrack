EDGE_CASES = [
    "1 0\n5\n",
    "2 0\n3 3\n",
    "2 0\n3 4\n",
    "5 0\n1 2 3 4 5\n",
    "5 100\n9 1 8 2 7\n",
    "6 1\n10 10 10 10 10 10\n",
    "4 1000000000\n1000000000 1 1000000000 1\n",
]
NUM_RANDOM = 14

def _case(rng, n, vmax, dmax):
    a = [rng.randint(1, vmax) for _ in range(n)]
    return f"{n} {rng.randint(0, dmax)}\n{' '.join(map(str, a))}\n"

def random_case(rng, i):
    if i >= NUM_RANDOM - 2:
        if i % 2:
            n = 6 * 10**4
            a = list(range(1, n + 1)); rng.shuffle(a)
            return f"{n} 0\n{' '.join(map(str, a))}\n"
        return _case(rng, 2 * 10**5, 10**9, 10**6)
    n = [10, 100, 1000, 5000, 2 * 10**4][min(i // 3, 4)]
    vmax = rng.choice([5, 100, 10**9])
    return _case(rng, n, vmax, rng.choice([0, 2, vmax // 3]))

def small_case(rng):
    n = rng.randint(1, 9)
    vmax = rng.choice([3, 10, 30])
    return _case(rng, n, vmax, rng.choice([0, 1, 5, 20]))

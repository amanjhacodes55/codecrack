EDGE_CASES = [
    "4\n1 1 1 1\n",
    "4\n1 2 3 1000000000\n",
    "5\n3 2 4 1 2\n",
    "7\n1 2 3 4 5 6 7\n",
    "6\n1000000000 1000000000 1000000000 1000000000 1000000000 1000000000\n",
    "8\n1 1 1 1 1 1 1 100\n",
]
NUM_RANDOM = 14

def _case(rng, n, vmax):
    if rng.random() < 0.2:
        a = sorted(rng.randint(1, vmax) for _ in range(n))
        if rng.random() < 0.5:
            a.reverse()
    else:
        a = [rng.randint(1, vmax) for _ in range(n)]
    return f"{n}\n{' '.join(map(str, a))}\n"

def random_case(rng, i):
    if i == NUM_RANDOM - 1:
        return _case(rng, 2 * 10**5, 10**9)
    n = rng.randint(4, [10, 100, 1000, 10**4, 5 * 10**4][min(i // 3, 4)])
    return _case(rng, n, rng.choice([3, 50, 10**9]))

def small_case(rng):
    return _case(rng, rng.randint(4, 10), rng.choice([3, 10, 100]))

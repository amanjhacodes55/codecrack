EDGE_CASES = [
    "1 0\n0\n",
    "1 5\n5\n",
    "1 0\n5\n",
    "3 0\n0 0 0\n",
    "4 7\n1 2 4 8\n",
    "3 3\n1 2 3\n",
    "5 1073741823\n1073741823 0 1073741823 5 5\n",
]
NUM_RANDOM = 12

def _case(rng, n, bits, kmode):
    a = [rng.randrange(1 << bits) for _ in range(n)]
    if kmode == 0:
        k = 0
    elif kmode == 1:  # reachable
        k = 0
        for x in a:
            if rng.random() < 0.5: k ^= x
    else:
        k = rng.randrange(1 << bits)
    return f"{n} {k}\n{' '.join(map(str, a))}\n"

def random_case(rng, i):
    if i >= NUM_RANDOM - 2:
        return _case(rng, 100000, 30 if i == NUM_RANDOM - 1 else 12, 1)
    n = rng.randint(1, [10, 100, 1000, 10000, 50000][min(i // 2, 4)])
    return _case(rng, n, rng.choice([3, 8, 20, 30]), i % 3)

def small_case(rng):
    return _case(rng, rng.randint(1, 12), rng.choice([1, 2, 3, 4]), rng.randint(0, 2))

EDGE_CASES = [
    "1 3\n4\n3 1\n2 1 1\n",
    "2 5\n2 1 2\n1 1 2\n2 2 1\n1 2 1\n4\n",
    "3 4\n1 1 1\n3 1\n4\n2 2 3\n",
]
NUM_RANDOM = 12

def _case(rng, n, q, plink):
    ops = []
    for _ in range(q):
        r = rng.random()
        if r < plink:
            ops.append(f"1 {rng.randint(1, n)} {rng.randint(1, n)}")
        elif r < plink + (1 - plink) / 2:
            ops.append(f"2 {rng.randint(1, n)} {rng.randint(1, n)}")
        elif r < plink + 3 * (1 - plink) / 4:
            ops.append(f"3 {rng.randint(1, n)}")
        else:
            ops.append("4")
    return f"{n} {q}\n" + "\n".join(ops) + "\n"

def random_case(rng, i):
    if i >= NUM_RANDOM - 2:
        return _case(rng, 200000 if i == NUM_RANDOM - 1 else 1000, 120000 if i == NUM_RANDOM - 1 else 40000, 0.5)
    n = rng.randint(1, [10, 100, 1000, 5000, 15000][min(i // 2, 4)])
    q = rng.randint(1, [10, 100, 1000, 5000, 15000][min(i // 2, 4)])
    return _case(rng, n, q, rng.choice([0.2, 0.5, 0.8]))

def small_case(rng):
    return _case(rng, rng.randint(1, 7), rng.randint(1, 12), rng.choice([0.3, 0.6]))

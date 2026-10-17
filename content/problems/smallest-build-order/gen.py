EDGE_CASES = [
    "1 0\n",
    "3 0\n",
    "2 1\n2 1\n",
    "2 2\n1 2\n2 1\n",
    "3 3\n1 2\n2 3\n1 2\n",
    "4 1\n3 3\n",
    "5 4\n5 4\n4 3\n3 2\n2 1\n",
]
NUM_RANDOM = 12

def _dag(rng, n, m, cyc):
    perm = list(range(1, n + 1)); rng.shuffle(perm)
    edges = []
    for _ in range(m):
        if n == 1:
            a = b = 1
            if not cyc:
                break
        else:
            i, j = sorted(rng.sample(range(n), 2))
            a, b = perm[i], perm[j]
        edges.append((a, b))
    if cyc and n >= 2 and edges:
        i, j = sorted(rng.sample(range(n), 2))
        edges.append((perm[j], perm[i]))
        rng.shuffle(edges)
    return f"{n} {len(edges)}\n" + "".join(f"{a} {b}\n" for a, b in edges)

def random_case(rng, i):
    if i >= NUM_RANDOM - 2:
        n = 100000 if i == NUM_RANDOM - 1 else 20000
        return _dag(rng, n, 70000 if n == 100000 else 40000, i == NUM_RANDOM - 2)
    n = rng.randint(2, [10, 100, 1000, 5000, 10000][min(i // 2, 4)])
    m = rng.randint(0, 2 * n)
    return _dag(rng, n, m, rng.random() < 0.3)

def small_case(rng):
    n = rng.randint(1, 6)
    return _dag(rng, n, rng.randint(0, 7), rng.random() < 0.3)

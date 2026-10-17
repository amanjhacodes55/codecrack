EDGE_CASES = [
    "1 0 0\n",
    "1 1 2\n1 1 5\n",
    "2 0 3\n",
    "2 1 0\n1 2 7\n",
    "2 1 1\n2 1 7\n",
    "3 3 1\n1 2 1\n2 3 1\n1 3 3\n",
    "4 2 5\n1 2 10\n3 4 10\n",
]
NUM_RANDOM = 12

def _case(rng, n, m, k, wmax, chain):
    edges = []
    if chain:
        perm = list(range(2, n)); rng.shuffle(perm)
        path = [1] + perm + [n] if n > 1 else [1]
        for a, b in zip(path, path[1:]):
            edges.append((a, b, rng.randint(1, wmax)))
    while len(edges) < m:
        edges.append((rng.randint(1, n), rng.randint(1, n), rng.randint(1, wmax)))
    rng.shuffle(edges)
    return f"{n} {len(edges)} {k}\n" + "".join(f"{u} {v} {w}\n" for u, v, w in edges)

def random_case(rng, i):
    if i >= NUM_RANDOM - 2:
        return _case(rng, 10000, 20000, 5 if i == NUM_RANDOM - 1 else 3, 10**9, True)
    n = rng.randint(2, [8, 50, 300, 2000, 6000][min(i // 2, 4)])
    m = rng.randint(n - 1, min(20000, 2 * n))
    return _case(rng, n, m, rng.randint(0, 5), rng.choice([10, 1000, 10**9]), rng.random() < 0.7)

def small_case(rng):
    n = rng.randint(1, 6)
    return _case(rng, n, rng.randint(0, 8), rng.randint(0, 3), rng.choice([5, 20]), rng.random() < 0.5)

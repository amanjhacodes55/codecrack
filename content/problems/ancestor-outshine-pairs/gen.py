EDGE_CASES = [
    "1\n5\n",
    "2\n1 2\n1 2\n",
    "2\n2 1\n2 1\n",
    "3\n7 7 7\n1 2\n2 3\n",
    "4\n1 2 3 4\n1 2\n2 3\n3 4\n",
    "5\n5 4 3 2 1\n1 2\n1 3\n1 4\n1 5\n",
]
NUM_RANDOM = 12

def _tree(rng, n, shape):
    edges = []
    for v in range(2, n + 1):
        if shape == 0: par = v - 1
        elif shape == 1: par = 1
        elif shape == 2: par = rng.randint(max(1, v - 3), v - 1)
        else: par = rng.randint(1, v - 1)
        edges.append((par, v))
    lab = list(range(1, n + 1)); rng.shuffle(lab); lab = [0] + lab
    out = [(lab[a], lab[b]) if rng.random() < 0.5 else (lab[b], lab[a]) for a, b in edges]
    rng.shuffle(out)
    return out

def _case(rng, n, vmax, shape):
    vals = [rng.randint(1, vmax) for _ in range(n)]
    return f"{n}\n{' '.join(map(str, vals))}\n" + "".join(f"{a} {b}\n" for a, b in _tree(rng, n, shape))

def random_case(rng, i):
    if i >= NUM_RANDOM - 2:
        return _case(rng, 100000 if i == NUM_RANDOM - 1 else 30000, 10**9 if i == NUM_RANDOM - 2 else 1000, 0 if i == NUM_RANDOM - 1 else 3)
    n = rng.randint(1, [10, 100, 1000, 3000, 8000][min(i // 2, 4)])
    return _case(rng, n, rng.choice([3, 100, 10**9]), i % 4)

def small_case(rng):
    return _case(rng, rng.randint(1, 9), rng.choice([2, 4, 10]), rng.randint(0, 3))

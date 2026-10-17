EDGE_CASES = [
    "2\n1 2\n2\n1 2\n2 1\n",
    "3\n1 2\n2 3\n3\n1 3\n3 1\n2 3\n",
    "4\n1 2\n1 3\n1 4\n3\n2 3\n1 4\n4 1\n",
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

def _case(rng, n, q, shape):
    qs = []
    for _ in range(q):
        a, b = rng.sample(range(1, n + 1), 2)
        qs.append(f"{a} {b}")
    return f"{n}\n" + "".join(f"{a} {b}\n" for a, b in _tree(rng, n, shape)) + f"{q}\n" + "\n".join(qs) + "\n"

def random_case(rng, i):
    if i >= NUM_RANDOM - 2:
        return _case(rng, 100000 if i == NUM_RANDOM - 1 else 20000, 30000, 0 if i == NUM_RANDOM - 1 else 3)
    n = rng.randint(2, [8, 100, 1000, 3000, 6000][min(i // 2, 4)])
    return _case(rng, n, rng.randint(1, min(5000, 2 * n)), i % 4)

def small_case(rng):
    n = rng.randint(2, 7)
    return _case(rng, n, rng.randint(1, 5), rng.randint(0, 3))

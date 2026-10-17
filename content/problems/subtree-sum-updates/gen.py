EDGE_CASES = [
    "1\n5\n3\n2 1\n1 1 -7\n2 1\n",
    "2\n1 2\n2 1\n3\n2 1\n2 2\n1 1 10\n",
    "3\n0 0 0\n1 2\n2 3\n2\n2 3\n2 1\n",
]
NUM_RANDOM = 12

def _tree(rng, n, shape):
    edges = []
    for v in range(2, n + 1):
        if shape == 0: par = v - 1                         # path (deep)
        elif shape == 1: par = 1                           # star
        else: par = rng.randint(max(1, v - 5), v - 1) if shape == 2 else rng.randint(1, v - 1)
        edges.append((par, v))
    lab = list(range(1, n + 1)); rng.shuffle(lab)
    lab = [0] + lab
    # keep node 1 as label 1 not required: root is always node 1 in statement
    out = []
    for a, b in edges:
        a, b = lab[a], lab[b]
        out.append((a, b) if rng.random() < 0.5 else (b, a))
    rng.shuffle(out)
    return out

def _case(rng, n, q, vmax, shape):
    vals = [rng.randint(-vmax, vmax) for _ in range(n)]
    edges = _tree(rng, n, shape)
    qs = []
    for _ in range(q):
        if rng.random() < 0.5:
            qs.append(f"1 {rng.randint(1, n)} {rng.randint(-vmax, vmax)}")
        else:
            qs.append(f"2 {rng.randint(1, n)}")
    return (f"{n}\n{' '.join(map(str, vals))}\n" + "".join(f"{a} {b}\n" for a, b in edges)
            + f"{q}\n" + "\n".join(qs) + "\n")

def random_case(rng, i):
    if i >= NUM_RANDOM - 2:
        return _case(rng, 50000 if i == NUM_RANDOM - 1 else 20000, 30000, 10**9 if i == NUM_RANDOM - 2 else 10**4, 0 if i == NUM_RANDOM - 1 else 3)
    n = rng.randint(1, [10, 100, 1000, 2000, 5000][min(i // 2, 4)])
    return _case(rng, n, rng.randint(1, n + 5), rng.choice([10, 10**9]), i % 4)

def small_case(rng):
    n = rng.randint(1, 8)
    return _case(rng, n, rng.randint(1, 8), 10, rng.randint(0, 3))

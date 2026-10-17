EDGE_CASES = [
    "1 0\n2\n0 0\n1 5\n",
    "2 0\n1\n1 100\n",
    "2 1\n1 2 5\n3\n5 5\n1 4\n6 10\n",
    "3 3\n1 2 1\n2 3 1\n1 3 1\n2\n1 1\n2 2\n",
    "4 2\n1 2 3\n1 2 1\n2\n1 1\n3 3\n",
]
NUM_RANDOM = 12

def _case(rng, n, m, wmax, q):
    lines = []
    for _ in range(m):
        u = rng.randint(1, n); v = rng.randint(1, n)
        lines.append(f"{u} {v} {rng.randint(1, wmax)}")
    qs = []
    for _ in range(q):
        a = rng.randint(0, wmax * min(n, 6)); b = rng.randint(0, wmax * min(n, 6))
        a, b = min(a, b), max(a, b)
        qs.append(f"{a} {b}")
    return f"{n} {m}\n" + "".join(l + "\n" for l in lines) + f"{q}\n" + "\n".join(qs) + "\n"

def random_case(rng, i):
    if i >= NUM_RANDOM - 2:
        return _case(rng, 200, 2000, 10**6 if i == NUM_RANDOM - 1 else 50, 50000)
    n = rng.randint(1, [6, 20, 60, 120, 200][min(i // 2, 4)])
    m = rng.randint(0, min(2000, n * 3))
    return _case(rng, n, m, rng.choice([5, 100, 10**6]), rng.randint(1, 2000))

def small_case(rng):
    n = rng.randint(1, 6)
    return _case(rng, n, rng.randint(0, 8), rng.choice([3, 10]), rng.randint(1, 5))

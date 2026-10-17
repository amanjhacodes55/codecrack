EDGE_CASES = [
    "1 1\n5\n",
    "1 4\n7 7 7 7\n",
    "4 1\n-3\n-3\n-3\n-3\n",
    "3 3\n1 1 1\n1 1 1\n1 1 1\n",
    "4 4\n9 1 2 5\n3 9 5 4\n8 5 9 6\n5 2 7 9\n",
    "4 4\n1 2 3 4\n5 6 7 8\n9 1 2 3\n4 5 6 7\n",
    "2 8\n1 1 1 2 2 2 2 1\n0 0 0 1 0 0 0 1\n",
]
NUM_RANDOM = 14

def _grid(rng, r, c, k, lo=-5):
    g = [[rng.randint(lo, lo + k - 1) for _ in range(c)] for _ in range(r)]
    # optionally plant some streaks
    for _ in range(rng.randint(0, 3)):
        di, dj = rng.choice([(0, 1), (1, 0), (1, 1), (1, -1)])
        if (di and r < 4) or (dj and c < 4):
            continue
        i0 = rng.randint(0, r - 1 - 3 * di)
        j0 = rng.randint(3 if dj < 0 else 0, c - 1 - (3 if dj > 0 else 0))
        v = rng.randint(lo, lo + k + 5)
        for t in range(4):
            g[i0 + t * di][j0 + t * dj] = v
    return f"{r} {c}\n" + "\n".join(" ".join(map(str, row)) for row in g) + "\n"

def random_case(rng, i):
    if i >= NUM_RANDOM - 2:
        return _grid(rng, 400, 400, 10**9, lo=-10**9) if i % 2 else _grid(rng, 400, 400, 3)
    r = rng.randint(1, [6, 20, 60, 150, 300][min(i // 3, 4)])
    c = rng.randint(1, [6, 20, 60, 150, 300][min(i // 3, 4)])
    return _grid(rng, r, c, rng.choice([2, 3, 5, 100]))

def small_case(rng):
    return _grid(rng, rng.randint(1, 6), rng.randint(1, 6), rng.choice([2, 3, 4]))

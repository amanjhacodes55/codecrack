EDGE_CASES = [
    "1 1\n5\n",
    "1 2\n0 1000000000\n",
    "2 2\n7 7\n7 7\n",
    "3 1\n1\n10\n4\n",
]
NUM_RANDOM = 12

def _case(rng, r, c, hi, smooth):
    if smooth:
        g = []
        for i in range(r):
            row = []
            for j in range(c):
                base = (g[i-1][j] if i else 0) if j == 0 else row[-1]
                row.append(max(0, min(hi, base + rng.randint(-hi // 50 - 1, hi // 50 + 1))))
            g.append(row)
    else:
        g = [[rng.randint(0, hi) for _ in range(c)] for _ in range(r)]
    return f"{r} {c}\n" + "\n".join(' '.join(map(str, row)) for row in g) + "\n"

def random_case(rng, i):
    if i >= NUM_RANDOM - 2:
        return _case(rng, 200, 200, 10**9, i == NUM_RANDOM - 1)
    s = [4, 15, 40, 100, 150][min(i // 2, 4)]
    return _case(rng, rng.randint(1, s), rng.randint(1, s), rng.choice([10, 1000, 10**9]), i % 2 == 0)

def small_case(rng):
    return _case(rng, rng.randint(1, 4), rng.randint(1, 4), rng.choice([5, 30]), False)

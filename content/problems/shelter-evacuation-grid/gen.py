EDGE_CASES = [
    "1 1\nS\n",
    "1 1\n.\n",
    "1 1\n#\n",
    "1 5\nS...S\n",
    "2 2\n##\n##\n",
    "3 3\n...\n.#.\n...\n",
    "3 4\nS#..\n.#..\n.#.S\n",
    "5 1\nS\n.\n#\n.\n.\n",
]
NUM_RANDOM = 12

def _grid(rng, r, c, pwall, nst):
    g = [['#' if rng.random() < pwall else '.' for _ in range(c)] for _ in range(r)]
    for _ in range(nst):
        g[rng.randrange(r)][rng.randrange(c)] = 'S'
    return f"{r} {c}\n" + "\n".join(''.join(row) for row in g) + "\n"

def random_case(rng, i):
    if i >= NUM_RANDOM - 2:
        r, c = (500, 500) if i == NUM_RANDOM - 1 else (1, 200000)
        return _grid(rng, r, c, 0.25 if i == NUM_RANDOM - 1 else 0.02, rng.randint(1, 30))
    r = rng.randint(1, [5, 20, 60, 150, 300][min(i // 2, 4)])
    c = rng.randint(1, [5, 20, 60, 150, 300][min(i // 2, 4)])
    return _grid(rng, r, c, rng.choice([0.0, 0.15, 0.35, 0.5]), rng.randint(0, max(1, r * c // 50)))

def small_case(rng):
    r, c = rng.randint(1, 6), rng.randint(1, 6)
    return _grid(rng, r, c, rng.choice([0.0, 0.2, 0.4]), rng.randint(0, 3))

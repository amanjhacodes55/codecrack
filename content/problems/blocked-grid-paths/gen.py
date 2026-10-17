EDGE_CASES = [
    "1 1 0\n",
    "1 5 0\n",
    "1 5 1\n1 3\n",
    "2 2 2\n1 2\n2 1\n",
    "100000 100000 0\n",
    "3 3 1\n2 2\n",
]
NUM_RANDOM = 12

def _case(rng, h, w, k, near_diag=False):
    cells = set()
    tries = 0
    while len(cells) < k and tries < 20 * k + 100:
        tries += 1
        if near_diag:
            r = rng.randint(1, h)
            c = max(1, min(w, int(r * w / h) + rng.randint(-3, 3)))
        else:
            r, c = rng.randint(1, h), rng.randint(1, w)
        if (r, c) in ((1, 1), (h, w)):
            continue
        cells.add((r, c))
    cells = list(cells); rng.shuffle(cells)
    return f"{h} {w} {len(cells)}\n" + "".join(f"{r} {c}\n" for r, c in cells)

def random_case(rng, i):
    if i >= NUM_RANDOM - 2:
        return _case(rng, 100000, 100000 if i == NUM_RANDOM - 1 else 777, 1000, True)
    hmax = [5, 50, 1000, 50000, 100000][min(i // 2, 4)]
    h, w = rng.randint(1, hmax), rng.randint(1, hmax)
    return _case(rng, h, w, rng.randint(0, min(1000, h * w - 2 if h * w > 2 else 0)), i % 2 == 0)

def small_case(rng):
    h, w = rng.randint(1, 6), rng.randint(1, 6)
    k = rng.randint(0, max(0, min(6, h * w - 2)))
    return _case(rng, h, w, k, rng.random() < 0.5)

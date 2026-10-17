EDGE_CASES = [
    "1\n1 1\n1 1\n",
    "1\n1000000000 1\n1000000000 1\n",
    "2\n1 100\n1 100\n1 100\n1 100\n",
    "3\n5 5\n5 5\n5 5\n5 5\n5 5\n5 5\n",
]
NUM_RANDOM = 16

def _make(rng, n, hi):
    lines = [f"{rng.randint(1, hi)} {rng.randint(1, hi)}" for _ in range(2 * n)]
    return f"{n}\n" + "\n".join(lines) + "\n"

def random_case(rng, i):
    n = [3, 25, 250, 1000, 3000][min(i // 3, 4)]
    if i == NUM_RANDOM - 2: n = 100000
    if i == NUM_RANDOM - 1: n = 20000
    hi = 10**9 if i % 2 else 1000
    return _make(rng, n, hi)

def small_case(rng):
    return _make(rng, rng.randint(1, 5), rng.choice([3, 50]))

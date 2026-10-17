EDGE_CASES = [
    "1\n0 2359\n",
    "1\n1200 1200\n",
    "2\n1000 1000\n1000 1000\n",
    "2\n900 1000\n1001 1100\n",
    "3\n0 2359\n0 2359\n0 2359\n",
    "4\n900 905\n905 910\n910 915\n915 920\n",
]
NUM_RANDOM = 16

def _hhmm(m):
    return (m // 60) * 100 + m % 60

def _make(rng, n, span):
    lines = []
    for _ in range(n):
        a = rng.randint(0, 1439)
        b = min(1439, a + rng.randint(0, span))
        lines.append(f"{_hhmm(a)} {_hhmm(b)}")
    return f"{n}\n" + "\n".join(lines) + "\n"

def random_case(rng, i):
    n = [5, 50, 500, 5000, 20000][min(i // 3, 4)]
    if i == NUM_RANDOM - 1: n = 200000
    return _make(rng, n, rng.choice([10, 60, 240, 1439]))

def small_case(rng):
    n = rng.randint(1, 8)
    lines = []
    for _ in range(n):
        a = rng.randint(0, 20)
        b = min(1439, a + rng.randint(0, 6))
        lines.append(f"{_hhmm(a)} {_hhmm(b)}")
    return f"{n}\n" + "\n".join(lines) + "\n"

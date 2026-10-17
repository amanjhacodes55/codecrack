EDGE_CASES = [
    "1 1\n1 1\n",
    "1 2\n1 100\n10 12\n",
    "3 3\n1 9\n11 11\n1 1000000000000000000\n",
    "100 2\n1 1000000000000000000\n999999999999999999 1000000000000000000\n",
    "7 1\n123456789 987654321\n",
    "10 1\n10 99\n",
]
NUM_RANDOM = 12


def random_case(rng, i):
    D = rng.randint(1, 100) if i % 2 else rng.randint(1, 12)
    T = [5, 20, 100][min(i // 4, 2)]
    lines = []
    for _ in range(T):
        e = rng.randint(1, 18)
        a = rng.randint(1, 10**e)
        b = rng.randint(1, 10**rng.randint(1, 18))
        lo, hi = min(a, b), max(a, b)
        lines.append(f"{lo} {hi}")
    return f"{D} {T}\n" + "\n".join(lines) + "\n"


def small_case(rng):
    D = rng.randint(1, 15)
    T = rng.randint(1, 3)
    lines = []
    for _ in range(T):
        a, b = rng.randint(1, 1500), rng.randint(1, 1500)
        lines.append(f"{min(a, b)} {max(a, b)}")
    return f"{D} {T}\n" + "\n".join(lines) + "\n"

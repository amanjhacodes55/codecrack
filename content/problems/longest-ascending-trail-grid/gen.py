EDGE_CASES = [
    "1 1\n5\n",
    "2 2\n7 7\n7 7\n",
    "1 6\n1 2 3 4 5 6\n",
    "3 3\n1 2 3\n8 9 4\n7 6 5\n",
    "3 1\n3\n2\n1\n",
]
NUM_RANDOM = 14


def _grid(rng, r, c, hi):
    return f"{r} {c}\n" + "\n".join(" ".join(str(rng.randint(0, hi)) for _ in range(c)) for _ in range(r)) + "\n"


def _snake(r, c):
    rows = []
    for i in range(r):
        row = list(range(i * c, (i + 1) * c))
        rows.append(row if i % 2 == 0 else row[::-1])
    return f"{r} {c}\n" + "\n".join(" ".join(map(str, row)) for row in rows) + "\n"


def random_case(rng, i):
    if i == NUM_RANDOM - 1:
        return _snake(300, 300)
    r = [3, 10, 50, 150][min(i // 3, 3)]
    c = [4, 10, 60, 150][min(i // 3, 3)]
    if i == NUM_RANDOM - 2:
        r, c = 300, 300
    hi = [5, 100, 10**9][i % 3]
    return _grid(rng, r, c, hi)


def small_case(rng):
    return _grid(rng, rng.randint(1, 3), rng.randint(1, 4), rng.choice([3, 9, 20]))

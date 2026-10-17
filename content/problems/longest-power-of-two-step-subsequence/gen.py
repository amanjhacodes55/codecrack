EDGE_CASES = [
    "1\n7\n",
    "4\n5 5 5 5\n",
    "5\n9 7 5 3 1\n",
    "6\n1 2 3 4 5 6\n",
    "5\n1 4 7 10 13\n",
    "3\n1 536870913 1000000000\n",
]
NUM_RANDOM = 14


def _walk(rng, n, start):
    a, x = [], start
    for _ in range(n):
        r = rng.random()
        if r < 0.15:
            a.append(rng.randint(1, 10**9))
            continue
        if r < 0.35:
            x = max(1, x - rng.randint(0, 50))
        else:
            x = min(10**9, x + (1 << rng.randint(0, 6)) * rng.choice([1, 1, 1, 3]))
        a.append(x)
    return a


def random_case(rng, i):
    n = [10, 100, 1000, 10**4][min(i // 3, 3)]
    if i >= NUM_RANDOM - 2:
        n = 5 * 10**4
    if i % 3 == 0:
        a = [rng.randint(1, 64) for _ in range(n)]
    elif i % 3 == 1:
        a = _walk(rng, n, rng.randint(1, 1000))
    else:
        a = [rng.randint(1, 10**9) for _ in range(n)]
    return f"{n}\n{' '.join(map(str, a))}\n"


def small_case(rng):
    n = rng.randint(1, 11)
    return f"{n}\n{' '.join(str(rng.randint(1, 12)) for _ in range(n))}\n"

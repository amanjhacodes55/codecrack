EDGE_CASES = [
    "1 1\n1\n",
    "2 1\n1\n",
    "3 1\n1\n",
    "1000000000 1\n100000\n",
    "6 3\n1 1 1\n",
    "7 3\n1 1 1\n",
    "5 4\n5 5 5 5\n",
]
NUM_RANDOM = 17

def random_case(rng, i):
    n = [5, 50, 500, 5000, 50000, 200000][min(i // 3, 5)]
    a = [rng.randint(1, 10**5 if i % 2 else 100) for _ in range(n)]
    s = 2 * sum(a)
    mode = i % 3
    if mode == 0:
        e = min(10**9, s + rng.randint(1, 10))          # usually impossible
    elif mode == 1:
        e = max(1, min(10**9, rng.randint(1, s)))
    else:
        e = max(1, min(10**9, s // rng.randint(2, 50)))
    return f"{e} {n}\n{' '.join(map(str, a))}\n"

def small_case(rng):
    n = rng.randint(1, 6)
    a = [rng.randint(1, 9) for _ in range(n)]
    e = rng.randint(1, 2 * sum(a) + 3)
    return f"{e} {n}\n{' '.join(map(str, a))}\n"

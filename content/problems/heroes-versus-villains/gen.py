EDGE_CASES = [
    "1 1 1\n1\n",
    "1 1 1\n2\n",
    "1 1 1000000000\n1000000000\n",
    "5 1 1\n1 1 1 1 1\n",
    "5 200000 1000000000\n1000000000 1000000000 1000000000 1000000000 1000000000\n",
    "3 2 3\n10 1 1\n",
]
NUM_RANDOM = 16

def random_case(rng, i):
    n = [5, 50, 500, 5000, 20000][min(i // 3, 4)]
    if i == NUM_RANDOM - 2: n = 200000
    if i == NUM_RANDOM - 1: n = 100000
    m = rng.randint(1, n)
    hi = 10**9 if i % 2 else 100
    v = [rng.randint(1, hi) for _ in range(n)]
    # choose H so that the answer is somewhere in the middle
    target = sum(v[rng.randint(0, n - 1):])
    h = max(1, min(10**9, target // m + rng.randint(-2, 2)))
    return f"{n} {m} {h}\n{' '.join(map(str, v))}\n"

def small_case(rng):
    n = rng.randint(1, 7)
    m = rng.randint(1, 4)
    h = rng.randint(1, 8)
    v = [rng.randint(1, 8) for _ in range(n)]
    return f"{n} {m} {h}\n{' '.join(map(str, v))}\n"

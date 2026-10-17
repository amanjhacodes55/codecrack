EDGE_CASES = [
    "1\n5\n",
    "2\n3 3\n",
    "2\n3 4\n",
    "5\n0 0 0 0 0\n",
    "6\n-1 1 -1 1 -1 1\n",
    "4\n1000000000 -1000000000 1000000000 -1000000000\n",
]
NUM_RANDOM = 16

def random_case(rng, i):
    n = [5, 50, 500, 5000, 20000][min(i // 3, 4)]
    if i == NUM_RANDOM - 2: n = 200000
    if i == NUM_RANDOM - 1: n = 100000
    if i % 2 == 0:
        a = [rng.randint(0, 2) for _ in range(n)]         # many balanced removals
    else:
        a = [rng.randint(-10**9, 10**9) for _ in range(n)]
    return f"{n}\n{' '.join(map(str, a))}\n"

def small_case(rng):
    n = rng.randint(1, 8)
    a = [rng.randint(-2, 2) for _ in range(n)]
    return f"{n}\n{' '.join(map(str, a))}\n"

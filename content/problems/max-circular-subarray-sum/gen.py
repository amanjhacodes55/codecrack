EDGE_CASES = [
    "1\n-1000000000\n",
    "1\n7\n",
    "2\n-1 -1\n",
    "3\n0 0 0\n",
    "4\n5 -100 -100 5\n",
    "5\n1000000000 1000000000 -1 1000000000 1000000000\n",
    "6\n-1 -2 -3 -4 -5 -6\n",
]
NUM_RANDOM = 16

def random_case(rng, i):
    n = [5, 50, 500, 5000, 20000][min(i // 3, 4)]
    if i == NUM_RANDOM - 2: n = 200000
    if i == NUM_RANDOM - 1: n = 100000
    mode = i % 3
    if mode == 0:
        a = [rng.randint(-100, 100) for _ in range(n)]
    elif mode == 1:
        a = [rng.randint(-10**9, 10**9) for _ in range(n)]
    else:
        a = [rng.randint(-10**9, -1) for _ in range(n)]   # all negative
    if i == NUM_RANDOM - 2:
        a = [rng.randint(-100, 100) for _ in range(n)]
    return f"{n}\n{' '.join(map(str, a))}\n"

def small_case(rng):
    n = rng.randint(1, 8)
    a = [rng.randint(-6, 6) for _ in range(n)]
    return f"{n}\n{' '.join(map(str, a))}\n"

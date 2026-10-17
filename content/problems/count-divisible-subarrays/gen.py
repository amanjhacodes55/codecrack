EDGE_CASES = [
    "1 1\n-7\n",
    "1 3\n0\n",
    "3 1000000000\n1000000000 -1000000000 1000000000\n",
    "5 2\n-1 -1 -1 -1 -1\n",
    "4 7\n1 2 3 4\n",
]
NUM_RANDOM = 16

def random_case(rng, i):
    n = [5, 50, 500, 5000, 20000][min(i // 3, 4)]
    if i == NUM_RANDOM - 2: n = 200000
    if i == NUM_RANDOM - 1: n = 100000
    if i % 2 == 0:
        k = rng.randint(1, 10)
        a = [rng.randint(-20, 20) for _ in range(n)]
    else:
        k = rng.choice([rng.randint(1, 1000), rng.randint(1, 10**9)])
        a = [rng.randint(-10**9, 10**9) for _ in range(n)]
    if i == NUM_RANDOM - 2:
        k = 1   # every subarray counts: answer ~ 2e10
    return f"{n} {k}\n{' '.join(map(str, a))}\n"

def small_case(rng):
    n = rng.randint(1, 10)
    k = rng.randint(1, 6)
    a = [rng.randint(-6, 6) for _ in range(n)]
    return f"{n} {k}\n{' '.join(map(str, a))}\n"

EDGE_CASES = [
    "1\n0\n",
    "2\n7 -7\n",
    "2\n-1000000000 1000000000\n",
    "3\n0 0 0\n",
    "4\n-5 0 0 5\n",
    "5\n1 -1 1 -1 0\n",
]
NUM_RANDOM = 16

def _make(rng, n, hi):
    a = [rng.randint(-hi, hi) for _ in range(n - 1)]
    a.append(-sum(a))
    # keep last value inside limits by re-balancing if needed
    while abs(a[-1]) > 10**9:
        i = rng.randrange(n - 1)
        a[-1] += a[i]
        a[i] = 0
    rng.shuffle(a)
    return f"{n}\n{' '.join(map(str, a))}\n"

def random_case(rng, i):
    n = [5, 50, 500, 5000, 20000][min(i // 3, 4)]
    if i == NUM_RANDOM - 2: n = 200000
    if i == NUM_RANDOM - 1: n = 100000
    hi = 10**9 if i % 2 else 1000
    return _make(rng, n, hi)

def small_case(rng):
    return _make(rng, rng.randint(1, 8), 5)

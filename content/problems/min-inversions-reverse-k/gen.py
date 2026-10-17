EDGE_CASES = [
    "1 1\n1\n",
    "2 2\n2 1\n",
    "2 2\n1 2\n",
    "5 5\n5 4 3 2 1\n",
    "5 1\n3 1 2 5 4\n",
    "6 3\n1 2 3 4 5 6\n",
    "6 4\n2 1 6 5 4 3\n",
]
NUM_RANDOM = 14

def _perm(rng, n, mode):
    a = list(range(1, n + 1))
    if mode == 0:
        rng.shuffle(a)
    else:  # nearly sorted with some descending blocks
        i = 0
        while i < n:
            L = rng.randint(1, max(1, n // 5))
            if rng.random() < 0.5:
                a[i:i + L] = a[i:i + L][::-1]
            i += L
        for _ in range(n // 20):
            x, y = rng.randrange(n), rng.randrange(n)
            a[x], a[y] = a[y], a[x]
    return a

def _case(rng, n, mode):
    k = rng.randint(1, n)
    return f"{n} {k}\n{' '.join(map(str, _perm(rng, n, mode)))}\n"

def random_case(rng, i):
    if i >= NUM_RANDOM - 2:
        n = 10**5
        k = rng.choice([n // 2, 300])
        return f"{n} {k}\n{' '.join(map(str, _perm(rng, n, i % 2)))}\n"
    n = [8, 60, 500, 5000, 3 * 10**4][min(i // 3, 4)]
    return _case(rng, n, i % 2)

def small_case(rng):
    return _case(rng, rng.randint(1, 8), rng.randint(0, 1))

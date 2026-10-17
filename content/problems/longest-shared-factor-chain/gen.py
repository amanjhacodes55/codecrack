EDGE_CASES = [
    "1\n1\n",
    "3\n1 1 1\n",
    "4\n2 3 5 7\n",
    "5\n6 10 15 35 77\n",
    "6\n4 4 4 4 4 4\n",
    "4\n99991 99989 99991 1\n",
]
NUM_RANDOM = 14


def _make(rng, n, hi):
    a = [rng.randint(1, hi) for _ in range(n)]
    return f"{n}\n{' '.join(map(str, a))}\n"


def random_case(rng, i):
    n = [10, 100, 1000, 10**4][min(i // 3, 3)]
    if i >= NUM_RANDOM - 2:
        n = 10**5
    if i % 3 == 2:  # products of few large primes -> long chains are rarer
        primes = [p for p in range(2, 320) if all(p % q for q in range(2, int(p ** 0.5) + 1))]
        a = []
        for _ in range(n):
            x = rng.choice(primes)
            if rng.random() < 0.6:
                y = rng.choice(primes)
                if x * y <= 10**5:
                    x *= y
            a.append(x)
        return f"{n}\n{' '.join(map(str, a))}\n"
    return _make(rng, n, 10**5 if i % 3 else 60)


def small_case(rng):
    return _make(rng, rng.randint(1, 11), rng.choice([10, 30, 100]))

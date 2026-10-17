EDGE_CASES = [
    "a\na\n",
    "a\nb\n",
    "z\nabcz\n",
    "abcz\nz\n",
    "abcdef\nabcdef\n",
    "aaaaaaa\nbbb\n",
    "intention\nexecution\n",
]
NUM_RANDOM = 14


def _s(rng, n, alpha):
    return "".join(rng.choice(alpha) for _ in range(n))


def random_case(rng, i):
    n = [5, 30, 200, 600, 1000][min(i // 3, 4)]
    alpha = "ab" if i % 3 == 0 else ("abcd" if i % 3 == 1 else "abcdefghijklmnopqrstuvwxyz")
    m = n if i % 2 else rng.randint(1, n)
    if i == NUM_RANDOM - 1:  # similar strings: mutate a copy
        a = list(_s(rng, 1000, alpha))
        b = a[:]
        for _ in range(60):
            b[rng.randrange(len(b))] = rng.choice(alpha)
        return "".join(a) + "\n" + "".join(b) + "\n"
    return _s(rng, n, alpha) + "\n" + _s(rng, m, alpha) + "\n"


def small_case(rng):
    return _s(rng, rng.randint(1, 6), "abc") + "\n" + _s(rng, rng.randint(1, 6), "abc") + "\n"

MOD = 10**9 + 7

EDGE_CASES = [
    "1\n2 1\n",
    "1\n0 1\n",
    "1\n0 5\n",
    "1\n1 1000000000000000000\n",
    "3\n2 10\n3 3\n10 4\n",
    "2\n1000000000 1000000000000000000\n999999999 999999999999999999\n",
    "2\n1 1000000007\n1 1000000008\n",
]
NUM_RANDOM = 12


def _make(rng, t, amax, nmax):
    lines = [str(t)]
    for _ in range(t):
        r = rng.random()
        if r < 0.1:
            a = rng.choice([0, 1])
        else:
            a = rng.randint(0, amax)
        lines.append(f"{a} {rng.randint(1, nmax)}")
    return "\n".join(lines) + "\n"


def random_case(rng, i):
    t = [5, 50, 500, 2000, 10**4][min(i // 3, 4)]
    if i % 2:
        return _make(rng, t, 10**9, 10**18)
    return _make(rng, t, 20, 10**6)


def small_case(rng):
    return _make(rng, rng.randint(1, 5), rng.choice([3, 10, 10**9]), 40)

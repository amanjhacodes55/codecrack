EDGE_CASES = [
    "1\n1\n",
    "1\n2\n",
    "3\n3\n6\n7\n",
    "4\n8\n15\n16\n17\n",
    "2\n1000000000000000000\n999999999999999999\n",
    "3\n576460752303423487\n576460752303423488\n1023\n",
]
NUM_RANDOM = 12


def _make(rng, t, nmax):
    vals = []
    for _ in range(t):
        r = rng.random()
        if r < 0.15:
            e = rng.randint(0, max(0, nmax.bit_length() - 2))
            v = (1 << e) + rng.choice([-1, 0, 1])
            v = max(1, min(nmax, v))
        else:
            v = rng.randint(1, nmax)
        vals.append(v)
    return f"{t}\n" + "\n".join(map(str, vals)) + "\n"


def random_case(rng, i):
    t = [5, 50, 500, 2000, 10**4][min(i // 3, 4)]
    nmax = [1000, 10**9, 10**18][i % 3]
    return _make(rng, t, nmax)


def small_case(rng):
    return _make(rng, rng.randint(1, 5), rng.choice([10, 100, 2000]))

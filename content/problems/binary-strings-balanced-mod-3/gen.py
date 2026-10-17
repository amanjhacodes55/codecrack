EDGE_CASES = [
    "1\n1\n",
    "1\n2\n",
    "3\n3 4 5\n",
    "1\n100000\n",
    "10\n1 2 3 4 5 6 7 8 9 10\n",
]
NUM_RANDOM = 12


def random_case(rng, i):
    t = [5, 50, 1000, 10**4, 10**5][min(i // 3, 4)]
    mx = [20, 1000, 10**4, 10**5, 10**5][min(i // 3, 4)]
    qs = [rng.randint(1, mx) for _ in range(t)]
    return f"{t}\n" + "\n".join(map(str, qs)) + "\n"


def small_case(rng):
    t = rng.randint(1, 4)
    return f"{t}\n" + "\n".join(str(rng.randint(1, 14)) for _ in range(t)) + "\n"

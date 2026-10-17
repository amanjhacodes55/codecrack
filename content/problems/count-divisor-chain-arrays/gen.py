EDGE_CASES = [
    "1 1\n",
    "1 100\n",
    "10000 1\n",
    "5 1\n",
    "6 3\n",
    "10000 100\n",
    "1024 100\n",
]
NUM_RANDOM = 12


def random_case(rng, i):
    n = [10, 100, 2000, 10**4][min(i // 3, 3)]
    k = [3, 10, 50, 100][min(i // 3, 3)]
    return f"{rng.randint(1, n)} {rng.randint(1, k)}\n"


def small_case(rng):
    return f"{rng.randint(1, 7)} {rng.randint(1, 4)}\n"

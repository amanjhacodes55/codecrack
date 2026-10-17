EDGE_CASES = [
    "1\n0\n",
    "1\n1\n",
    "2\n10\n11\n",
    "1\n" + "1" * 100000 + "\n",
    "1\n1" + "0" * 99999 + "\n",
    "3\n111111111111111111111111111111\n100000000000000000000000000000\n1010101010101010101\n",
]
NUM_RANDOM = 12

def _bin(rng, L, p1):
    if L == 1:
        return rng.choice("01")
    return "1" + "".join("1" if rng.random() < p1 else "0" for _ in range(L - 1))

def random_case(rng, i):
    t = [3, 10, 50, 100, 2][min(i // 3, 4)]
    L = [10, 100, 1000, 2000, 100000][min(i // 3, 4)]
    return f"{t}\n" + "\n".join(_bin(rng, rng.randint(1, L), rng.random()) for _ in range(t)) + "\n"

def small_case(rng):
    t = rng.randint(1, 3)
    return f"{t}\n" + "\n".join(_bin(rng, rng.randint(1, 7), rng.random()) for _ in range(t)) + "\n"

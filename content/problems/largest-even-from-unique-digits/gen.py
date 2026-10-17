import string
EDGE_CASES = [
    "1\nabc\n",
    "1\n0\n",
    "1\na1b3c5d7e9\n",
    "1\n00000\n",
    "2\nx0y5\n13579x8\n",
    "1\n9876543210\n",
    "3\n2\n7\n@#2a2b2\n",
]
NUM_RANDOM = 14
POOL = string.ascii_letters + "@#$%&*-_!"

def _s(rng, L, dprob, digits="0123456789"):
    return "".join(rng.choice(digits) if rng.random() < dprob else rng.choice(POOL) for _ in range(L))

def random_case(rng, i):
    t = [3, 20, 200, 1000, 2000][min(i // 3, 4)]
    L = [10, 30, 100, 300, 500][min(i // 3, 4)]
    lines = []
    for _ in range(t):
        dig = rng.choice(["0123456789", "13579", "13579", "02468", "0", "05", "123"])
        lines.append(_s(rng, rng.randint(1, L), rng.random(), dig))
    return f"{t}\n" + "\n".join(lines) + "\n"

def small_case(rng):
    t = rng.randint(1, 4)
    lines = []
    for _ in range(t):
        dig = rng.choice(["0123456789", "13579", "02", "0", "05", "1357"])
        lines.append(_s(rng, rng.randint(1, 9), rng.random(), dig))
    return f"{t}\n" + "\n".join(lines) + "\n"

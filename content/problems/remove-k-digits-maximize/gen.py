EDGE_CASES = [
    "7\n0\n",
    "10\n1\n",
    "9876\n2\n",
    "1234\n2\n",
    "1000000\n3\n",
    "5555\n3\n",
    "9" * 1000 + "\n999\n",
]
NUM_RANDOM = 17

def _num(rng, n, digits):
    first = rng.choice([c for c in digits if c != "0"] or ["1"])
    return first + "".join(rng.choice(digits) for _ in range(n - 1))

def random_case(rng, i):
    n = [8, 60, 600, 6000, 60000, 200000][min(i // 3, 5)]
    digits = "0123456789" if i % 3 else rng.choice(["01", "019", "123", "0123456789"])
    s = _num(rng, n, digits)
    k = rng.randint(0, n - 1)
    return f"{s}\n{k}\n"

def small_case(rng):
    n = rng.randint(1, 9)
    digits = rng.choice(["01", "0123456789", "129"])
    return f"{_num(rng, n, digits)}\n{rng.randint(0, n - 1)}\n"

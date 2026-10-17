EDGE_CASES = [
    "a\na\n0\n",
    "a\nz\n0\n",
    "a\nz\n1000\n",
    "az\nza\n3\n",
    "zzzz\naaaa\n0\n",
    "abc\nxyz\n7\n",
    "a\nzzzzzz\n5\n",
]
NUM_RANDOM = 14


def _s(rng, n, alpha):
    return "".join(rng.choice(alpha) for _ in range(n))


def random_case(rng, i):
    n = [4, 20, 80, 250, 500][min(i // 3, 4)]
    alpha = ["az", "abcmnoxyz", "abcdefghijklmnopqrstuvwxyz"][i % 3]
    m = n if i % 2 else rng.randint(1, n)
    k = rng.choice([0, 5, 20, 60, 200, 1000])
    if i == NUM_RANDOM - 1:  # second half "inverted" - switching pays off
        x = _s(rng, 500, "abcdefghijklm")
        y = x[:250] + "".join(chr(97 + 25 - (ord(ch) - 97)) for ch in x[250:])
        return f"{x}\n{y}\n40\n"
    return f"{_s(rng, n, alpha)}\n{_s(rng, m, alpha)}\n{k}\n"


def small_case(rng):
    alpha = rng.choice(["az", "abyz", "abcdefghijklmnopqrstuvwxyz"])
    return f"{_s(rng, rng.randint(1, 4), alpha)}\n{_s(rng, rng.randint(1, 4), alpha)}\n{rng.choice([0, 1, 3, 10, 30, 100])}\n"

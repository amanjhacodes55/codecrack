import string
EDGE_CASES = [
    "1\na 0\n",
    "1\nab 7\n",
    "2\nab 2\nxy 1\n",
    "3\nabc 0\nabc 1\nabc 11\n",
    "1\nzzzz 999999999999999999\n",
    "2\nHelloWorld 123456789\nPython 1000000000000000000\n",
]
NUM_RANDOM = 13
LET = string.ascii_letters

def _case(rng, n, maxlen, maxdig):
    lines = [str(n)]
    for _ in range(n):
        L = rng.randint(1, maxlen)
        s = "".join(rng.choice(LET) for _ in range(L))
        x = rng.randint(0, 10 ** rng.randint(1, maxdig) - 1)
        lines.append(f"{s} {x}")
    return "\n".join(lines) + "\n"

def random_case(rng, i):
    n = [5, 50, 300, 1500, 10**4][min(i // 3, 4)]
    return _case(rng, n, [10, 50, 100, 100, 100][min(i // 3, 4)], 18)

def small_case(rng):
    return _case(rng, rng.randint(1, 5), 6, 6)

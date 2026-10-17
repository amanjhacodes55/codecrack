EDGE_CASES = [
    "a\n",
    "ab\n",
    "aa\n",
    "aaaaaaaab\n",
    "baaaaaaaa\n",
    "abacaba\n",
    "a" * 199999 + "b\n",
]
NUM_RANDOM = 16

def random_case(rng, i):
    n = [8, 60, 600, 6000, 30000][min(i // 3, 4)]
    if i >= NUM_RANDOM - 2: n = 200000
    mode = i % 3
    if mode == 0:
        s = "".join(rng.choice("ab") for _ in range(n))
    elif mode == 1:
        h = "".join(rng.choice("abc") for _ in range(n // 2))
        pal = h + rng.choice(["", "x"]) + h[::-1]
        s = pal + "".join(rng.choice("abc") for _ in range(rng.randint(0, max(0, n - len(pal)))))
    else:
        s = "".join(rng.choice("abcdefghijklmnopqrstuvwxyz") for _ in range(n))
    return s[:200000] + "\n"

def small_case(rng):
    n = rng.randint(1, 10)
    return "".join(rng.choice("ab" if rng.random() < 0.7 else "abc") for _ in range(n)) + "\n"

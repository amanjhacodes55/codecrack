EDGE_CASES = [
    "1\na\n",
    "2\nab\nba\n",
    "2\nab\nabb\n",
    "3\naa\naa\naa\n",
    "4\nabc\ndef\nghi\njkl\n",
    "5\nab\nba\nab\nc\nc\n",
]
NUM_RANDOM = 14


def _make(rng, n, alpha, maxlen, nbase):
    bases = ["".join(rng.choice(alpha) for _ in range(rng.randint(1, maxlen))) for _ in range(nbase)]
    words = []
    for _ in range(n):
        w = list(rng.choice(bases))
        rng.shuffle(w)
        if rng.random() < 0.2:
            w[rng.randrange(len(w))] = rng.choice(alpha)
        words.append("".join(w))
    return f"{n}\n" + "\n".join(words) + "\n"


def random_case(rng, i):
    n = [5, 50, 500, 5000, 20000][min(i // 3, 4)]
    alpha = "abc" if i % 2 else "abcdefghijklmnopqrstuvwxyz"
    maxlen = [3, 6, 5][i % 3]
    nbase = max(1, n // [2, 10, 50][i % 3])
    return _make(rng, n, alpha, maxlen, nbase)


def small_case(rng):
    return _make(rng, rng.randint(1, 8), rng.choice(["ab", "abc"]), 3, rng.randint(1, 4))

EDGE_CASES = [
    "a\na\n",
    "a\nb\n",
    "ab\nba\n",
    "abc\nab\n",
    "aab\nabb\n",
    "zzzz\nzzzz\n",
    "abcd\ndcbaa\n",
    "listen\nsilent\n",
]
NUM_RANDOM = 14


def _pair(rng, n, alpha, mode):
    s = [rng.choice(alpha) for _ in range(n)]
    t = s[:]
    rng.shuffle(t)
    if mode == 1:          # change one character
        k = rng.randrange(n)
        t[k] = rng.choice(alpha)
    elif mode == 2:        # different length
        if rng.random() < 0.5 and n > 1:
            t.pop()
        else:
            t.append(rng.choice(alpha))
    return "".join(s) + "\n" + "".join(t) + "\n"


def random_case(rng, i):
    n = [5, 50, 1000, 10**4, 10**5][min(i // 3, 4)]
    alpha = "ab" if i % 2 else "abcdefghijklmnopqrstuvwxyz"
    return _pair(rng, n, alpha, i % 3)


def small_case(rng):
    return _pair(rng, rng.randint(1, 8), rng.choice(["ab", "abc", "xyz"]), rng.randint(0, 2))

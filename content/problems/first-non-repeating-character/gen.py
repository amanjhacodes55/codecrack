import string

EDGE_CASES = [
    "a\n",
    "aa\n",
    "ab\n",
    "aab\n",
    "abab\n",
    "zzzzzzzzzy\n",
    "abcdefghijklmnopqrstuvwxyz\n",
    "aabbccddee\n",
]
NUM_RANDOM = 14


def _make(rng, n, alpha):
    return "".join(rng.choice(alpha) for _ in range(n)) + "\n"


def random_case(rng, i):
    n = [10, 100, 1000, 10**4, 10**5][min(i // 3, 4)]
    if i == 12:  # every letter repeated, then one unique letter at the very end
        body = [rng.choice(string.ascii_lowercase[:25]) for _ in range(n // 2 - 1)]
        s = body + body[::-1] + ["z"]
        return "".join(s) + "\n"
    if i == 13:  # max size, no unique character
        half = [rng.choice(string.ascii_lowercase) for _ in range(n // 2)]
        s = half + half
        rng.shuffle(s)
        return "".join(s) + "\n"
    alpha = string.ascii_lowercase if i % 2 else string.ascii_lowercase[:rng.randint(2, 26)]
    s = _make(rng, n, alpha).strip()
    if i % 3 == 0:  # plant one unique character somewhere
        used = set(s)
        free = [c for c in string.ascii_lowercase if c not in used]
        if free:
            k = rng.randrange(len(s))
            s = s[:k] + free[0] + s[k + 1:]
    return s + "\n"


def small_case(rng):
    return _make(rng, rng.randint(1, 10), rng.choice(["ab", "abc", "abcd", "abcdefgh"]))

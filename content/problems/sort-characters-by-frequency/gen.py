import string

ALL = string.digits + string.ascii_uppercase + string.ascii_lowercase

EDGE_CASES = [
    "a\n",
    "Z\n",
    "aaaa\n",
    "ab\n",
    "ba\n",
    "aA\n",
    "9aZ\n",
    "abcabcabc\n",
    "zzyyxx\n",
    "1122aaBB\n",
]
NUM_RANDOM = 14


def _make(rng, n, alpha):
    return "".join(rng.choice(alpha) for _ in range(n)) + "\n"


def random_case(rng, i):
    n = [10, 100, 1000, 10**4, 10**5][min(i // 3, 4)]
    if i % 3 == 0:
        alpha = "ab"
    elif i % 3 == 1:
        alpha = string.ascii_lowercase
    else:
        alpha = ALL
    return _make(rng, n, alpha)


def small_case(rng):
    alpha = rng.choice(["ab", "abc", "aAbB", "a1Z", ALL])
    return _make(rng, rng.randint(1, 12), alpha)

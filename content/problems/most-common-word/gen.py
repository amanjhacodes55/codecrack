import string

EDGE_CASES = [
    "a\n",
    "Hello\n",
    "Bob hit a ball, the hit BALL flew far after it was hit.\n",
    "b a\n",
    "...Zebra!!! zebra?? APPLE apple\n",
    "don't stop, don't\n",
    "x1y2x3y\n",
    "   spaced     out   words   out  \n",
    "A-a-A-b-B\n",
]
NUM_RANDOM = 14

PUNCT = " ,.!?;:'\"-()0123456789"


def _word(rng, vocab):
    w = rng.choice(vocab)
    style = rng.random()
    if style < 0.2:
        w = w.upper()
    elif style < 0.4:
        w = w.capitalize()
    return w


def _make(rng, nwords, vocab):
    parts = []
    for k in range(nwords):
        parts.append(_word(rng, vocab))
        sep = "".join(rng.choice(PUNCT) for _ in range(rng.randint(1, 3)))
        if " " not in sep and rng.random() < 0.5:
            sep += " "
        parts.append(sep)
    s = "".join(parts)[:100000].strip()
    if not any(c.isalpha() for c in s):
        s = "a"
    return s + "\n"


def _vocab(rng, size, maxlen):
    return ["".join(rng.choice(string.ascii_lowercase[:6]) for _ in range(rng.randint(1, maxlen))) for _ in range(size)]


def random_case(rng, i):
    nwords = [5, 30, 300, 3000, 15000][min(i // 3, 4)]
    vocab = _vocab(rng, [3, 20, 200][i % 3], [3, 5, 8][i % 3])
    return _make(rng, nwords, vocab)


def small_case(rng):
    vocab = _vocab(rng, rng.randint(1, 4), 3)
    return _make(rng, rng.randint(1, 8), vocab)

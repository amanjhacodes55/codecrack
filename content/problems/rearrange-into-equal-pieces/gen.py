import string
EDGE_CASES = [
    "a\n",
    "zz\n",
    "ab\n",
    "aaaaaaaaaaaa\n",
    "abcabcabcabc\n",
    "aabbc\n",
    "a" * 200000 + "\n",
]
NUM_RANDOM = 17

def random_case(rng, i):
    n_target = [10, 100, 1000, 10**4, 10**5, 2 * 10**5][min(i // 3, 5)]
    letters = rng.sample(string.ascii_lowercase, rng.randint(1, 26))
    k = rng.choice([1, 2, 3, 4, 6, 12, 60, 120]) if i % 2 == 0 else 1
    per = max(1, n_target // (k * len(letters)))
    s = []
    for c in letters:
        s.extend(c * (k * rng.randint(1, per)))
    if i % 2 == 1:  # random counts
        s = [rng.choice(letters) for _ in range(n_target)]
    rng.shuffle(s)
    return "".join(s[:200000]) + "\n"

def small_case(rng):
    letters = "abc"[:rng.randint(1, 3)]
    n = rng.randint(1, 7)
    return "".join(rng.choice(letters) for _ in range(n)) + "\n"

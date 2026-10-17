EDGE_CASES = [
    "1 1\na\nb\n5\n",
    "1 1\na\na\n7\n",
    "3 2\naaa\naa\n4 1 9\n",
    "5 3\nabcde\nace\n10 10 1 10 10\n",
    "4 5\nabcd\nabcde\n1 1 1 1\n",
    "6 2\nababab\nba\n3 1 4 1 5 9\n",
]
NUM_RANDOM = 14

def _case(rng, n, m, alpha, cmax):
    s = "".join(rng.choice(alpha) for _ in range(n))
    if rng.random() < 0.6 and m <= n:
        idx = sorted(rng.sample(range(n), m))
        c = "".join(s[k] for k in idx)       # make C a subsequence
    else:
        c = "".join(rng.choice(alpha) for _ in range(m))
    costs = [rng.randint(1, cmax) for _ in range(n)]
    return f"{n} {m}\n{s}\n{c}\n{' '.join(map(str, costs))}\n"

def random_case(rng, i):
    if i == NUM_RANDOM - 1:
        n, m = 5 * 10**4, 100
        costs = [rng.randint(1, 10**9) for _ in range(n)]
        return f"{n} {m}\n{'a' * n}\n{'a' * m}\n{' '.join(map(str, costs))}\n"
    n = [8, 50, 500, 5000, 5 * 10**4][min(i // 3, 4)]
    m = rng.randint(1, min(100, n))
    return _case(rng, n, m, rng.choice(["ab", "abc", "abcdefghijklmnopqrstuvwxyz"]), rng.choice([10, 10**9]))

def small_case(rng):
    n = rng.randint(1, 10)
    return _case(rng, n, rng.randint(1, min(4, n)), rng.choice(["ab", "abc"]), 9)

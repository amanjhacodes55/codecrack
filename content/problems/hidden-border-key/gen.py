EDGE_CASES = [
    "a\n",
    "aa\n",
    "aaa\n",
    "ab\n",
    "abab\n",
    "abcab\n",
    "abcabcabc\n",
    "aabaaab\n",
]
NUM_RANDOM = 12

def _periodic(rng, n, alpha):
    p = rng.randint(1, max(1, min(n, 8)))
    base = ''.join(rng.choice(alpha) for _ in range(p))
    s = (base * (n // p + 1))[:n]
    s = list(s)
    for _ in range(rng.randint(0, 2)):
        s[rng.randrange(n)] = rng.choice(alpha)
    return ''.join(s)

def _bordered(rng, n, alpha):
    b = rng.randint(1, max(1, n // 3))
    border = ''.join(rng.choice(alpha) for _ in range(b))
    mid_len = max(0, n - 2 * b)
    mid = ''.join(rng.choice(alpha) for _ in range(mid_len))
    if mid_len > b and rng.random() < 0.5:
        k = rng.randint(0, mid_len - b)
        mid = mid[:k] + border[:rng.randint(1, b)] + mid[k + b:]
        mid = mid[:mid_len]
    return border + mid + border

def random_case(rng, i):
    if i >= NUM_RANDOM - 2:
        n = 500000
        s = _periodic(rng, n, "ab") if i == NUM_RANDOM - 1 else _bordered(rng, n, "abc")
        return s + "\n"
    n = rng.randint(1, [10, 100, 1000, 20000, 100000][min(i // 2, 4)])
    f = [_periodic, _bordered][i % 2]
    return f(rng, n, rng.choice(["ab", "abc", "abcdefghijklmnopqrstuvwxyz"])) + "\n"

def small_case(rng):
    n = rng.randint(1, 12)
    r = rng.random()
    if r < 0.4:
        return ''.join(rng.choice("ab") for _ in range(n)) + "\n"
    return [_periodic, _bordered][r < 0.7](rng, n, "abc") + "\n"

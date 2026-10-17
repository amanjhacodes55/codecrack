from math import isqrt
EDGE_CASES = [
    "1\n1\n",
    "1\n8\n",
    "3\n13\n7\n2\n",
    "2\n9999999998\n10000000000\n",
    "3\n9999999986\n4\n18\n",
]
NUM_RANDOM = 12

def _primes(n):
    s = bytearray([1]) * (n + 1); s[0] = s[1] = 0
    for i in range(2, isqrt(n) + 1):
        if s[i]:
            s[i*i::i] = bytearray(len(range(i*i, n + 1, i)))
    return [i for i in range(n + 1) if s[i]]

_P = _primes(70710)

def _val(rng, hi):
    r = rng.random()
    lim = isqrt(hi // 2)
    small = [p for p in _P if p <= lim] or [2]
    if r < 0.4:
        a = rng.choice(small); b = rng.choice(small)
        return a * a + b * b
    if r < 0.6:   # 2 mod 8 numbers with no representation are the hardest
        v = rng.randint(1, hi)
        return max(2, v - (v % 8) + 2) if v - (v % 8) + 2 <= hi else 2
    return rng.randint(1, hi)

def random_case(rng, i):
    t = [5, 20, 100, 500, 1000][min(i // 3, 4)]
    hi = [10**3, 10**5, 10**7, 10**10, 10**10][min(i // 3, 4)]
    return f"{t}\n" + "\n".join(str(_val(rng, hi)) for _ in range(t)) + "\n"

def small_case(rng):
    t = rng.randint(1, 4)
    return f"{t}\n" + "\n".join(str(_val(rng, 3000)) for _ in range(t)) + "\n"

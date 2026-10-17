EDGE_CASES = [
    "1\n0\n",
    "1\n1000000000\n",
    "2\n0 0\n",
    "2\n10 2\n",
    "3\n121 12 0\n",
    "4\n8 89 898 0\n",
    "5\n1 11 111 1111 11111\n",
]
NUM_RANDOM = 16

def _val(rng, style):
    if style == 0:
        return rng.randint(0, 10**9)
    if style == 1:
        return rng.choice([0, 1, 9, 10, 90, 99, 100, 909, 990])
    base = rng.choice(["1", "12", "121", "9", "98", "5"])
    return int((base * 4)[:rng.randint(1, 9)])

def random_case(rng, i):
    n = [5, 50, 500, 5000, 20000][min(i // 3, 4)]
    if i == NUM_RANDOM - 1:
        n = 100000
    style = i % 3
    a = [_val(rng, style) for _ in range(n)]
    return f"{n}\n{' '.join(map(str, a))}\n"

def small_case(rng):
    n = rng.randint(1, 6)
    style = rng.randint(0, 2)
    a = [_val(rng, style) % (10**rng.randint(1, 3)) if style == 0 else _val(rng, style) for _ in range(n)]
    return f"{n}\n{' '.join(map(str, a))}\n"

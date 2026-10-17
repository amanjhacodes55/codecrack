EDGE_CASES = [
    "1\n0\n",
    "1\n1\n",
    "3\n2\n3\n4\n",
    "4\n999999999999\n549755813888\n1099511627775\n1000000\n",
    "5\n8\n16\n31\n32\n33\n",
]
NUM_RANDOM = 12

def random_case(rng, i):
    t = [5, 50, 500, 5000, 10**4][min(i // 3, 4)]
    hi = [10**3, 10**6, 10**9, 10**12 - 1, 10**12 - 1][min(i // 3, 4)]
    vals = []
    for _ in range(t):
        r = rng.random()
        if r < 0.1:
            v = rng.randint(0, 50)
        elif r < 0.3:
            b = rng.randint(2, 1000); k = rng.randint(2, 6)
            v = min(hi, b ** k + rng.randint(-2, 2))
        else:
            v = rng.randint(0, hi)
        vals.append(max(0, v))
    return f"{t}\n" + "\n".join(map(str, vals)) + "\n"

def small_case(rng):
    t = rng.randint(1, 5)
    return f"{t}\n" + "\n".join(str(rng.randint(0, 600)) for _ in range(t)) + "\n"

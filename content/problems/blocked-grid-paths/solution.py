import sys

MOD = 10**9 + 7

def main():
    data = sys.stdin.buffer.read().split()
    h, w, k = int(data[0]), int(data[1]), int(data[2])
    pts = []
    for i in range(k):
        pts.append((int(data[3 + 2 * i]), int(data[4 + 2 * i])))
    pts.sort()
    pts.append((h, w))
    N = h + w
    fact = [1] * (N + 1)
    for i in range(1, N + 1):
        fact[i] = fact[i - 1] * i % MOD
    inv = [1] * (N + 1)
    inv[N] = pow(fact[N], MOD - 2, MOD)
    for i in range(N, 0, -1):
        inv[i - 1] = inv[i] * i % MOD
    def paths(dr, dc):
        return fact[dr + dc] * inv[dr] % MOD * inv[dc] % MOD
    f = []
    for i, (r, c) in enumerate(pts):
        val = paths(r - 1, c - 1)
        for j in range(i):
            rj, cj = pts[j]
            if rj <= r and cj <= c:
                val -= f[j] * paths(r - rj, c - cj)
        f.append(val % MOD)
    print(f[-1])

main()

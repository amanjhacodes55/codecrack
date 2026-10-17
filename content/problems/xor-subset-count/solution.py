import sys

MOD = 10**9 + 7

def main():
    data = sys.stdin.buffer.read().split()
    n, k = int(data[0]), int(data[1])
    basis = [0] * 30  # basis[b] has highest set bit b
    rank = 0
    for t in range(n):
        x = int(data[2 + t])
        for b in range(29, -1, -1):
            if not (x >> b) & 1:
                continue
            if basis[b]:
                x ^= basis[b]
            else:
                basis[b] = x
                rank += 1
                break
    x = k
    for b in range(29, -1, -1):
        if (x >> b) & 1 and basis[b]:
            x ^= basis[b]
    if x != 0:
        print(0)
        return
    ans = pow(2, n - rank, MOD)
    if k == 0:
        ans = (ans - 1) % MOD
    print(ans)

main()

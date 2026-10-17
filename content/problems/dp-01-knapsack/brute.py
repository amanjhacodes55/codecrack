import sys
d = sys.stdin.read().split()
n, W = int(d[0]), int(d[1])
w = list(map(int, d[2:2 + n])); v = list(map(int, d[2 + n:2 + 2 * n]))
best = 0
for mask in range(1 << n):
    tw = sum(w[i] for i in range(n) if mask >> i & 1)
    if tw <= W:
        best = max(best, sum(v[i] for i in range(n) if mask >> i & 1))
print(best)

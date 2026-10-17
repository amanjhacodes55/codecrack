import sys
d = sys.stdin.read().split()
n = int(d[0]); a = list(map(int, d[1:1 + n]))
best = 0
for mask in range(1 << n):
    if mask & (mask >> 1):
        continue
    best = max(best, sum(a[i] for i in range(n) if mask >> i & 1))
print(best)

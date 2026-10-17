import sys
d = sys.stdin.read().split()
n = int(d[0]); a = list(map(int, d[1:1 + n]))
best = None
for l in range(n):
    p = 1
    for r in range(l, n):
        if r > l and a[r] <= a[r - 1]:
            break
        p *= a[r]
        best = p if best is None or p > best else best
print(best)

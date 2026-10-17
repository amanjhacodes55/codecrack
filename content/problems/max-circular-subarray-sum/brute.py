import sys
d = sys.stdin.read().split()
n = int(d[0]); a = list(map(int, d[1:1 + n]))
best = None
for s in range(n):
    t = 0
    for L in range(1, n + 1):
        t += a[(s + L - 1) % n]
        best = t if best is None or t > best else best
print(best)

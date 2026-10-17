import sys
d = sys.stdin.read().split()
n = int(d[0]); a = list(map(int, d[1:1 + n]))
best = None
for i in range(1, n):
    for j in range(i + 1, n):
        for k in range(j + 1, n):
            parts = [sum(a[:i]), sum(a[i:j]), sum(a[j:k]), sum(a[k:])]
            v = max(parts) - min(parts)
            if best is None or v < best:
                best = v
print(best)

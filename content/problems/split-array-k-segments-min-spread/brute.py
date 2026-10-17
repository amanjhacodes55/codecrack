import sys
from itertools import combinations
d = sys.stdin.read().split()
n, k = int(d[0]), int(d[1]); a = list(map(int, d[2:2 + n]))
best = None
for cuts in combinations(range(1, n), k - 1):
    b = [0] + list(cuts) + [n]
    cost = sum(max(a[b[t]:b[t + 1]]) - min(a[b[t]:b[t + 1]]) for t in range(k))
    if best is None or cost < best:
        best = cost
print(best)

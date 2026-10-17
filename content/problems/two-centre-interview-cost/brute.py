import sys
from itertools import combinations
d = sys.stdin.read().split()
n = int(d[0])
c = [(int(d[1 + 2 * i]), int(d[2 + 2 * i])) for i in range(2 * n)]
best = None
for A in combinations(range(2 * n), n):
    s = set(A)
    t = sum(c[i][0] if i in s else c[i][1] for i in range(2 * n))
    best = t if best is None or t < best else best
print(best)

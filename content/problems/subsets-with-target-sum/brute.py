import sys
from itertools import combinations
d = sys.stdin.read().split()
n, t = int(d[0]), int(d[1]); a = sorted(map(int, d[2:2+n]))
res = []
for r in range(1, n + 1):
    for c in combinations(a, r):
        if sum(c) == t:
            res.append(list(c))
res.sort()
print(len(res))
for c in res:
    print(*c)

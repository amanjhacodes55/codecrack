import sys
from itertools import product
d = sys.stdin.read().split()
n, e = int(d[0]), int(d[1]); a = list(map(int, d[2:2 + n]))
best = -1
for cnt in product(range(3), repeat=n):
    if sum(c * x for c, x in zip(cnt, a)) == e:
        s = sum(cnt)
        if best == -1 or s < best:
            best = s
print(best)

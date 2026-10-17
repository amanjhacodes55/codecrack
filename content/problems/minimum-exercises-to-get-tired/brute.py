import sys
from itertools import product
d = sys.stdin.read().split()
e, n = int(d[0]), int(d[1])
a = list(map(int, d[2:2 + n]))
best = -1
for mult in product(range(3), repeat=n):
    if sum(m * x for m, x in zip(mult, a)) >= e:
        c = sum(mult)
        if best == -1 or c < best:
            best = c
print(best)

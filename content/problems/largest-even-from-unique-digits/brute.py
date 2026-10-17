import sys
from itertools import permutations
d = sys.stdin.read().split()
t = int(d[0])
for i in range(t):
    s = d[1 + i]
    ds = sorted(set(c for c in s if c.isdigit()))
    best = -1
    for p in permutations(ds):
        if p and int(p[-1]) % 2 == 0:
            if p[0] == '0' and len(p) > 1:
                continue
            best = max(best, int("".join(p)))
    print(best)

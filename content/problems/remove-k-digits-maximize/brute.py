import sys
from itertools import combinations
d = sys.stdin.read().split()
s = d[0]; k = int(d[1]); n = len(s)
best = -1
for keep in combinations(range(n), n - k):
    v = int("".join(s[i] for i in keep))
    best = max(best, v)
print(best)

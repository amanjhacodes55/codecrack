import sys
from functools import lru_cache
d = sys.stdin.read().split()
n, m = int(d[0]), int(d[1])
cnt = [0] * (m + 3)
for x in d[2:2 + n]:
    cnt[int(x)] += 1
@lru_cache(None)
def go(state):
    c = list(state)
    i = next((k for k in range(len(c)) if c[k]), None)
    if i is None:
        return 0
    best = 0
    c[i] -= 1; best = max(best, go(tuple(c))); c[i] += 1          # throw one away
    if c[i] >= 3:
        c[i] -= 3; best = max(best, 1 + go(tuple(c))); c[i] += 3
    if i + 2 < len(c) and c[i + 1] and c[i + 2]:
        c[i] -= 1; c[i + 1] -= 1; c[i + 2] -= 1
        best = max(best, 1 + go(tuple(c)))
    return best
print(go(tuple(cnt)))

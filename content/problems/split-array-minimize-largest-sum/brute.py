import sys
from functools import lru_cache
d = sys.stdin.read().split()
n, k = int(d[0]), int(d[1]); a = list(map(int, d[2:2+n]))
INF = float("inf")

@lru_cache(maxsize=None)
def best(i, parts):
    # split a[i:] into exactly `parts` non-empty contiguous pieces
    if parts == 1:
        return sum(a[i:])
    res = INF
    for j in range(i + 1, n - parts + 2):
        res = min(res, max(sum(a[i:j]), best(j, parts - 1)))
    return res

print(best(0, k))

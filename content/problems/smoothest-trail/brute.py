import sys
from collections import deque
d = list(map(int, sys.stdin.read().split()))
r, c = d[0], d[1]; h = d[2:]
def ok(t):
    seen = {0}; q = deque([0])
    while q:
        u = q.popleft(); i, j = divmod(u, c)
        for a, b in ((i+1,j),(i-1,j),(i,j+1),(i,j-1)):
            if 0 <= a < r and 0 <= b < c:
                v = a*c+b
                if v not in seen and abs(h[u]-h[v]) <= t:
                    seen.add(v); q.append(v)
    return r*c-1 in seen
t = 0
while not ok(t): t += 1
print(t)

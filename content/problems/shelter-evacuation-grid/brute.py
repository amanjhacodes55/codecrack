import sys
from collections import deque
d = sys.stdin.read().split()
r, c = int(d[0]), int(d[1]); g = d[2:2 + r]
def bfs(si, sj):
    dist = {(si, sj): 0}; q = deque([(si, sj)])
    while q:
        i, j = q.popleft()
        for a, b in ((i+1,j),(i-1,j),(i,j+1),(i,j-1)):
            if 0 <= a < r and 0 <= b < c and g[a][b] != '#' and (a, b) not in dist:
                dist[(a, b)] = dist[(i, j)] + 1; q.append((a, b))
    return dist
INF = float('inf')
best = [[INF]*c for _ in range(r)]
for i in range(r):
    for j in range(c):
        if g[i][j] == 'S':
            for (a, b), v in bfs(i, j).items():
                best[a][b] = min(best[a][b], v)
mx = tot = st = 0
for i in range(r):
    for j in range(c):
        if g[i][j] != '#':
            if best[i][j] == INF: st += 1
            else: mx = max(mx, best[i][j]); tot += best[i][j]
print(mx, tot, st)

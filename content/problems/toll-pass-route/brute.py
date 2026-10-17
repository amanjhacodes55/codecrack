import sys
d = list(map(int, sys.stdin.read().split()))
n, m, k = d[0], d[1], d[2]
edges = []
p = 3
for _ in range(m):
    u, v, w = d[p], d[p+1], d[p+2]; p += 3
    edges += [(u, v, w), (v, u, w)]
INF = float('inf')
D = [[INF] * (k + 1) for _ in range(n + 1)]
D[1][0] = 0
changed = True
while changed:
    changed = False
    for u, v, w in edges:
        for j in range(k + 1):
            if D[u][j] == INF: continue
            if D[u][j] + w < D[v][j]: D[v][j] = D[u][j] + w; changed = True
            if j < k and D[u][j] + w // 2 < D[v][j+1]: D[v][j+1] = D[u][j] + w // 2; changed = True
b = min(D[n])
print(-1 if b == INF else b)

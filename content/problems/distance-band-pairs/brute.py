import sys
d = list(map(int, sys.stdin.read().split()))
n, m = d[0], d[1]
INF = float('inf')
D = [[INF] * (n + 1) for _ in range(n + 1)]
for i in range(n + 1): D[i][i] = 0
p = 2
for _ in range(m):
    u, v, w = d[p], d[p+1], d[p+2]; p += 3
    D[u][v] = min(D[u][v], w); D[v][u] = min(D[v][u], w)
for k in range(1, n + 1):
    for i in range(1, n + 1):
        for j in range(1, n + 1):
            if D[i][k] + D[k][j] < D[i][j]: D[i][j] = D[i][k] + D[k][j]
q = d[p]; p += 1
for _ in range(q):
    L, R = d[p], d[p+1]; p += 2
    print(sum(1 for i in range(1, n+1) for j in range(i+1, n+1) if L <= D[i][j] <= R))

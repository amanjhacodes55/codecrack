import sys
d = sys.stdin.read().split()
r, c = int(d[0]), int(d[1])
g = [list(map(int, d[2 + i * c:2 + (i + 1) * c])) for i in range(r)]


def dfs(i, j):  # no memoisation: explores every ascending trail
    best = 1
    for di, dj in ((1, 0), (-1, 0), (0, 1), (0, -1)):
        a, b = i + di, j + dj
        if 0 <= a < r and 0 <= b < c and g[a][b] > g[i][j]:
            best = max(best, 1 + dfs(a, b))
    return best


print(max(dfs(i, j) for i in range(r) for j in range(c)))

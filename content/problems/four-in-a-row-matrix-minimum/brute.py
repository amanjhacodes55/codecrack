import sys
d = sys.stdin.read().split()
r, c = int(d[0]), int(d[1])
g = [[int(d[2 + i * c + j]) for j in range(c)] for i in range(r)]
found = []
for i in range(r):
    for j in range(c):
        for di, dj in ((0, 1), (1, 0), (1, 1), (1, -1), (0, -1), (-1, 0), (-1, -1), (-1, 1)):
            cells = [(i + k * di, j + k * dj) for k in range(4)]
            if all(0 <= x < r and 0 <= y < c for x, y in cells):
                vals = {g[x][y] for x, y in cells}
                if len(vals) == 1:
                    found.append(g[i][j])
print(min(found) if found else -1)

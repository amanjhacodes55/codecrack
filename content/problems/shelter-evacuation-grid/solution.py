import sys
from collections import deque

def main():
    data = sys.stdin.buffer.read().split()
    r, c = int(data[0]), int(data[1])
    W = c + 2
    # padded flat grid: 0 = wall, 1 = open
    open_ = bytearray((r + 2) * W)
    dist = [-1] * ((r + 2) * W)
    q = deque()
    for i in range(r):
        row = data[2 + i]
        base = (i + 1) * W + 1
        for j in range(c):
            ch = row[j]
            if ch != 35:  # '#'
                open_[base + j] = 1
                if ch == 83:  # 'S'
                    dist[base + j] = 0
                    q.append(base + j)
    steps = (1, -1, W, -W)
    while q:
        u = q.popleft()
        nd = dist[u] + 1
        for s in steps:
            v = u + s
            if open_[v] and dist[v] < 0:
                dist[v] = nd
                q.append(v)
    best = 0; total = 0; stranded = 0
    for idx in range(len(dist)):
        if open_[idx]:
            d = dist[idx]
            if d < 0:
                stranded += 1
            else:
                total += d
                if d > best:
                    best = d
    print(best, total, stranded)

main()

import sys
import heapq
from bisect import bisect_left, bisect_right

def main():
    data = sys.stdin.buffer.read().split()
    n, m = int(data[0]), int(data[1])
    adj = [[] for _ in range(n + 1)]
    p = 2
    for _ in range(m):
        u, v, w = int(data[p]), int(data[p + 1]), int(data[p + 2]); p += 3
        adj[u].append((v, w)); adj[v].append((u, w))
    INF = float('inf')
    dists = []
    for s in range(1, n + 1):
        dist = [INF] * (n + 1)
        dist[s] = 0
        pq = [(0, s)]
        while pq:
            d, u = heapq.heappop(pq)
            if d > dist[u]:
                continue
            for v, w in adj[u]:
                nd = d + w
                if nd < dist[v]:
                    dist[v] = nd
                    heapq.heappush(pq, (nd, v))
        for t in range(s + 1, n + 1):
            if dist[t] < INF:
                dists.append(dist[t])
    dists.sort()
    q = int(data[p]); p += 1
    out = []
    for _ in range(q):
        lo, hi = int(data[p]), int(data[p + 1]); p += 2
        out.append(bisect_right(dists, hi) - bisect_left(dists, lo) if lo <= hi else 0)
    sys.stdout.write("\n".join(map(str, out)) + "\n")

main()

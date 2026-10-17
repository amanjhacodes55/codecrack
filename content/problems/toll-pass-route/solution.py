import sys
import heapq

def main():
    data = sys.stdin.buffer.read().split()
    n, m, k = int(data[0]), int(data[1]), int(data[2])
    adj = [[] for _ in range(n + 1)]
    p = 3
    for _ in range(m):
        u, v, w = int(data[p]), int(data[p + 1]), int(data[p + 2]); p += 3
        adj[u].append((v, w)); adj[v].append((u, w))
    K1 = k + 1
    INF = float('inf')
    dist = [INF] * ((n + 1) * K1)  # state = node*K1 + used
    dist[1 * K1] = 0
    pq = [(0, 1, 0)]
    while pq:
        d, u, used = heapq.heappop(pq)
        if d > dist[u * K1 + used]:
            continue
        if u == n:
            print(d); return
        for v, w in adj[u]:
            s = v * K1 + used
            nd = d + w
            if nd < dist[s]:
                dist[s] = nd
                heapq.heappush(pq, (nd, v, used))
            if used < k:
                nd = d + w // 2
                if nd < dist[s + 1]:
                    dist[s + 1] = nd
                    heapq.heappush(pq, (nd, v, used + 1))
    print(-1)

main()

import sys
from bisect import bisect_right

def main():
    data = sys.stdin.buffer.read().split()
    n = int(data[0])
    adj = [[] for _ in range(n + 1)]
    p = 1
    for _ in range(n - 1):
        u, v = int(data[p]), int(data[p + 1]); p += 2
        adj[u].append(v); adj[v].append(u)
    tin = [0] * (n + 1)
    parent = [0] * (n + 1)
    order = []
    stack = [1]; parent[1] = -1
    t = 0
    while stack:
        u = stack.pop()
        tin[u] = t; t += 1
        order.append(u)
        for v in adj[u]:
            if v != parent[u]:
                parent[v] = u
                stack.append(v)
    size = [1] * (n + 1)
    child_tins = [[] for _ in range(n + 1)]
    child_ids = [[] for _ in range(n + 1)]
    for u in order:  # preorder → children appended in increasing tin
        pu = parent[u]
        if pu > 0:
            child_tins[pu].append(tin[u]); child_ids[pu].append(u)
    for u in reversed(order):
        if parent[u] > 0:
            size[parent[u]] += size[u]

    def side(a, b):
        # number of nodes x such that the path x -> b passes through a
        if tin[a] <= tin[b] < tin[a] + size[a]:
            idx = bisect_right(child_tins[a], tin[b]) - 1
            return n - size[child_ids[a][idx]]
        return size[a]

    q = int(data[p]); p += 1
    out = []
    for _ in range(q):
        a, b = int(data[p]), int(data[p + 1]); p += 2
        out.append(side(a, b) * side(b, a))
    sys.stdout.write("\n".join(map(str, out)) + "\n")

main()

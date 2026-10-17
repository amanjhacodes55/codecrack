import sys

def main():
    data = sys.stdin.buffer.read().split()
    n = int(data[0])
    val = [0] + [int(x) for x in data[1:1 + n]]
    p = 1 + n
    adj = [[] for _ in range(n + 1)]
    for _ in range(n - 1):
        u, v = int(data[p]), int(data[p + 1]); p += 2
        adj[u].append(v); adj[v].append(u)
    tin = [0] * (n + 1); tout = [0] * (n + 1)
    parent = [0] * (n + 1)
    timer = 0
    stack = [1]
    parent[1] = -1
    order = []
    while stack:
        u = stack.pop()
        timer += 1
        tin[u] = timer
        order.append(u)
        for v in adj[u]:
            if v != parent[u]:
                parent[v] = u
                stack.append(v)
    # subtree sizes via reverse preorder
    size = [1] * (n + 1)
    for u in reversed(order):
        if parent[u] > 0:
            size[parent[u]] += size[u]
    for u in range(1, n + 1):
        tout[u] = tin[u] + size[u] - 1
    # Fenwick built in O(n)
    tree = [0] * (n + 1)
    for u in range(1, n + 1):
        tree[tin[u]] += val[u]
    for i in range(1, n + 1):
        j = i + (i & -i)
        if j <= n:
            tree[j] += tree[i]
    def prefix(i):
        s = 0
        while i > 0:
            s += tree[i]; i -= i & -i
        return s
    q = int(data[p]); p += 1
    out = []
    for _ in range(q):
        if data[p] == b'1':
            u, x = int(data[p + 1]), int(data[p + 2]); p += 3
            delta = x - val[u]; val[u] = x
            i = tin[u]
            while i <= n:
                tree[i] += delta; i += i & -i
        else:
            u = int(data[p + 1]); p += 2
            out.append(prefix(tout[u]) - prefix(tin[u] - 1))
    sys.stdout.write("\n".join(map(str, out)) + ("\n" if out else ""))

main()

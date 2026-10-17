import sys

def main():
    data = sys.stdin.buffer.read().split()
    n = int(data[0])
    val = [0] + [int(x) for x in data[1:1 + n]]
    adj = [[] for _ in range(n + 1)]
    p = 1 + n
    for _ in range(n - 1):
        u, v = int(data[p]), int(data[p + 1]); p += 2
        adj[u].append(v); adj[v].append(u)
    ranks = {x: i + 1 for i, x in enumerate(sorted(set(val[1:])))}
    m = len(ranks)
    rk = [0] * (n + 1)
    for u in range(1, n + 1):
        rk[u] = ranks[val[u]]
    tree = [0] * (m + 1)
    ans = 0
    visited = [False] * (n + 1)
    stack = [1]  # positive = enter, negative = exit
    while stack:
        u = stack.pop()
        if u > 0:
            visited[u] = True
            r = rk[u]
            # count active ancestors with rank < r
            i = r - 1; s = 0
            while i > 0:
                s += tree[i]; i -= i & -i
            ans += s
            i = r
            while i <= m:
                tree[i] += 1; i += i & -i
            stack.append(-u)
            for v in adj[u]:
                if not visited[v]:
                    stack.append(v)
        else:
            i = rk[-u]
            while i <= m:
                tree[i] -= 1; i += i & -i
    print(ans)

main()

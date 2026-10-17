import sys
d = list(map(int, sys.stdin.read().split()))
n = d[0]; p = 1
adj = [[] for _ in range(n + 1)]
for _ in range(n - 1):
    u, v = d[p], d[p+1]; p += 2; adj[u].append(v); adj[v].append(u)
def path(u, v):
    par = {u: None}; st = [u]
    while st:
        x = st.pop()
        for y in adj[x]:
            if y not in par: par[y] = x; st.append(y)
    res = []; x = v
    while x is not None: res.append(x); x = par[x]
    return res[::-1]
P = {(u, v): path(u, v) for u in range(1, n+1) for v in range(1, n+1) if u != v}
q = d[p]; p += 1
for _ in range(q):
    a, b = d[p], d[p+1]; p += 2
    c = 0
    for pth in P.values():
        if a in pth and b in pth and pth.index(a) < pth.index(b): c += 1
    print(c)

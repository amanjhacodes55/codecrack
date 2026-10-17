import sys
d = sys.stdin.read().split()
n = int(d[0]); val = [0] + list(map(int, d[1:1+n])); p = 1 + n
adj = [[] for _ in range(n + 1)]
for _ in range(n - 1):
    u, v = int(d[p]), int(d[p+1]); p += 2; adj[u].append(v); adj[v].append(u)
par = [0] * (n + 1); par[1] = 0; st = [1]; seen = {1}
while st:
    u = st.pop()
    for v in adj[u]:
        if v not in seen: seen.add(v); par[v] = u; st.append(v)
ans = 0
for v in range(1, n + 1):
    a = par[v]
    while a:
        if val[v] > val[a]: ans += 1
        a = par[a]
print(ans)

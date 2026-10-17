import sys
d = sys.stdin.read().split()
n = int(d[0]); val = [0] + list(map(int, d[1:1+n])); p = 1 + n
adj = [[] for _ in range(n + 1)]
for _ in range(n - 1):
    u, v = int(d[p]), int(d[p+1]); p += 2; adj[u].append(v); adj[v].append(u)
par = [0] * (n + 1); par[1] = -1; st = [1]; seen = {1}
while st:
    u = st.pop()
    for v in adj[u]:
        if v not in seen: seen.add(v); par[v] = u; st.append(v)
def in_sub(x, u):
    while x != -1:
        if x == u: return True
        x = par[x]
    return False
q = int(d[p]); p += 1
for _ in range(q):
    if d[p] == '1':
        val[int(d[p+1])] = int(d[p+2]); p += 3
    else:
        u = int(d[p+1]); p += 2
        print(sum(val[x] for x in range(1, n + 1) if in_sub(x, u)))

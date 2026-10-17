import sys
d = sys.stdin.read().split()
n, q = int(d[0]), int(d[1])
adj = [set() for _ in range(n + 1)]
def comp(s):
    seen = {s}; st = [s]
    while st:
        u = st.pop()
        for v in adj[u]:
            if v not in seen: seen.add(v); st.append(v)
    return seen
p = 2; out = []
for _ in range(q):
    t = d[p]; p += 1
    if t == '1':
        u, v = int(d[p]), int(d[p+1]); p += 2; adj[u].add(v); adj[v].add(u)
    elif t == '2':
        u, v = int(d[p]), int(d[p+1]); p += 2; out.append("YES" if v in comp(u) else "NO")
    elif t == '3':
        out.append(str(len(comp(int(d[p]))))); p += 1
    else:
        seen = set(); c = 0
        for i in range(1, n + 1):
            if i not in seen: c += 1; seen |= comp(i)
        out.append(str(c))
print("\n".join(out))

import sys
d = sys.stdin.read().split()
n, m = int(d[0]), int(d[1]); s, c = d[2], d[3]
cost = list(map(int, d[4:4 + n]))
def is_sub(t, p):
    it = iter(t)
    return all(ch in it for ch in p)
best = None
for mask in range(1 << n):
    kept = "".join(s[i] for i in range(n) if not mask >> i & 1)
    if not is_sub(kept, c):
        v = sum(cost[i] for i in range(n) if mask >> i & 1)
        if best is None or v < best:
            best = v
print(best)

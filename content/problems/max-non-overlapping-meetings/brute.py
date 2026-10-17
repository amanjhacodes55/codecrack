import sys
d = sys.stdin.read().split()
n = int(d[0]); m = [(int(d[1+2*i]), int(d[2+2*i])) for i in range(n)]
best = 0
for mask in range(1 << n):
    sel = sorted(m[i] for i in range(n) if mask >> i & 1)
    if all(sel[k][1] <= sel[k+1][0] for k in range(len(sel) - 1)):
        best = max(best, len(sel))
print(best)

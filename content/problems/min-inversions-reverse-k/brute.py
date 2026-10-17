import sys
d = sys.stdin.read().split()
n, k = int(d[0]), int(d[1]); p = list(map(int, d[2:2 + n]))
def inv(a):
    return sum(1 for i in range(len(a)) for j in range(i + 1, len(a)) if a[i] > a[j])
best = inv(p)
for l in range(n - k + 1):
    q = p[:l] + p[l:l + k][::-1] + p[l + k:]
    best = min(best, inv(q))
print(best)

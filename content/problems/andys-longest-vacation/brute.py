import sys
d = sys.stdin.read().split()
n, m, k = int(d[0]), int(d[1]), int(d[2])
days = list(map(int, d[3:3 + m]))
best = 0
for L in range(1, n + 1):
    for R in range(L, n + 1):
        cost = sum(1 for x in days if L <= x <= R)
        if cost <= k:
            best = max(best, R - L + 1)
print(best)

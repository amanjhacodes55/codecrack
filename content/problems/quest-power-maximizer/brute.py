import sys
d = list(map(int, sys.stdin.read().split()))
n, k, p = d[0], d[1], d[2]
req = d[3:3+n]; gain = d[3+n:3+2*n]
best = p
def go(power, used, cnt):
    global best
    best = max(best, power)
    if cnt == k: return
    for i in range(n):
        if not used >> i & 1 and req[i] <= power:
            go(power + gain[i], used | 1 << i, cnt + 1)
go(p, 0, 0)
print(best)

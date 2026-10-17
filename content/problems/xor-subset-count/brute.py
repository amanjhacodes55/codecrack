import sys
d = list(map(int, sys.stdin.read().split()))
n, k = d[0], d[1]; a = d[2:2+n]
cnt = 0
for mask in range(1, 1 << n):
    x = 0
    for i in range(n):
        if mask >> i & 1: x ^= a[i]
    if x == k: cnt += 1
print(cnt % (10**9 + 7))

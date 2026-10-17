import sys
d = list(map(int, sys.stdin.read().split()))
h, w, k = d[0], d[1], d[2]
bl = {(d[3+2*i], d[4+2*i]) for i in range(k)}
dp = [[0]*(w+1) for _ in range(h+1)]
for r in range(1, h+1):
    for c in range(1, w+1):
        if (r, c) in bl: continue
        if r == 1 and c == 1: dp[r][c] = 1
        else: dp[r][c] = (dp[r-1][c] + dp[r][c-1]) % (10**9+7)
print(dp[h][w])

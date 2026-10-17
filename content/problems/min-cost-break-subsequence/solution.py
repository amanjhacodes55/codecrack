import sys

def main():
    data = sys.stdin.read().split()
    n, m = int(data[0]), int(data[1])
    s, c = data[2], data[3]
    cost = list(map(int, data[4:4 + n]))
    INF = float("inf")
    pos = {}
    for j in range(m - 1, -1, -1):          # descending order
        pos.setdefault(c[j], []).append(j)
    dp = [INF] * m                           # dp[j]: kept text matches exactly C[:j] greedily
    dp[0] = 0
    last = m - 1
    for i in range(n):
        lst = pos.get(s[i])
        if not lst:
            continue
        a = cost[i]
        for j in lst:
            t = dp[j]
            if t == INF:
                continue
            dp[j] = t + a                    # delete s[i]
            if j < last and t < dp[j + 1]:   # keep s[i]: matched prefix grows
                dp[j + 1] = t
    print(min(dp))

main()

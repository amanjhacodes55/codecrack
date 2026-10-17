import sys


def main():
    data = sys.stdin.buffer.read().split()
    r, c = int(data[0]), int(data[1])
    g = list(map(int, data[2:2 + r * c]))
    n = r * c
    dp = [1] * n  # dp[cell] = longest strictly ascending trail that ENDS at cell
    order = sorted(range(n), key=g.__getitem__)  # process cells by increasing height
    for v in order:
        h = g[v]
        best = 1
        i, j = divmod(v, c)
        if i > 0 and g[v - c] < h and dp[v - c] + 1 > best:
            best = dp[v - c] + 1
        if i < r - 1 and g[v + c] < h and dp[v + c] + 1 > best:
            best = dp[v + c] + 1
        if j > 0 and g[v - 1] < h and dp[v - 1] + 1 > best:
            best = dp[v - 1] + 1
        if j < c - 1 and g[v + 1] < h and dp[v + 1] + 1 > best:
            best = dp[v + 1] + 1
        dp[v] = best
    print(max(dp))


main()

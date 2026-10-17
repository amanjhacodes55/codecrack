import sys


def main():
    data = sys.stdin.buffer.read().split()
    n = int(data[0])
    a = list(map(int, data[1:1 + n]))
    pre = [0] * (n + 1)
    for i, x in enumerate(a):
        pre[i + 1] = pre[i] + x
    # dp[i][j] = min cost to merge piles i..j (inclusive) into one pile
    dp = [[0] * n for _ in range(n)]
    for length in range(2, n + 1):
        for i in range(0, n - length + 1):
            j = i + length - 1
            row_i = dp[i]
            best = min(row_i[m] + dp[m + 1][j] for m in range(i, j))
            row_i[j] = best + pre[j + 1] - pre[i]
    print(dp[0][n - 1])


main()

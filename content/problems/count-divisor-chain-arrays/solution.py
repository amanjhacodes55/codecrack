import sys

MOD = 10**9 + 7


def main():
    n, k = map(int, sys.stdin.read().split())
    dp = [0] + [1] * n  # dp[v] = chains of current length ending with value v
    for _ in range(k - 1):
        new = [0] * (n + 1)
        for d in range(1, n + 1):
            v = dp[d]
            for m in range(d, n + 1, d):
                new[m] += v
        dp = [x % MOD for x in new]
    print(sum(dp) % MOD)


main()

import sys


def main():
    data = sys.stdin.buffer.read().split()
    n, cap = int(data[0]), int(data[1])
    w = data[2:2 + n]
    v = data[2 + n:2 + 2 * n]
    dp = [0] * (cap + 1)  # dp[c] = best value with total weight <= c
    for i in range(n):
        wi, vi = int(w[i]), int(v[i])
        if wi > cap:
            continue
        shifted = [x + vi for x in dp[:cap + 1 - wi]]
        # new dp[c] = max(dp[c], dp[c - wi] + vi) for c >= wi (uses old dp -> each item once)
        dp = dp[:wi] + [a if a > b else b for a, b in zip(dp[wi:], shifted)]
    print(dp[cap])


main()

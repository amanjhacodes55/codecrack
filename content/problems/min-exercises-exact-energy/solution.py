import sys


def main():
    data = sys.stdin.buffer.read().split()
    n, e = int(data[0]), int(data[1])
    a = list(map(int, data[2:2 + n]))
    INF = 10**9
    dp = [0] + [INF] * e  # dp[c] = fewest exercises draining exactly c
    for x in a:
        if x > e:
            continue
        for _ in range(2):  # two 0/1 copies of the same exercise = "at most twice"
            shifted = [v + 1 for v in dp[:e + 1 - x]]
            dp = dp[:x] + [p if p < q else q for p, q in zip(dp[x:], shifted)]
    print(dp[e] if dp[e] < INF else -1)


main()

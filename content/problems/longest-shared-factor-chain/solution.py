import sys


def main():
    data = sys.stdin.buffer.read().split()
    n = int(data[0])
    a = list(map(int, data[1:1 + n]))
    mx = max(a)
    spf = list(range(mx + 1))  # smallest prime factor sieve
    i = 2
    while i * i <= mx:
        if spf[i] == i:
            for j in range(i * i, mx + 1, i):
                if spf[j] == j:
                    spf[j] = i
        i += 1
    best = {}  # best[p] = longest valid chain so far whose last element is divisible by prime p
    ans = 0
    for x in a:
        ps = []
        y = x
        while y > 1:
            p = spf[y]
            ps.append(p)
            while y % p == 0:
                y //= p
        cur = 0
        for p in ps:
            v = best.get(p, 0)
            if v > cur:
                cur = v
        cur += 1
        for p in ps:
            if best.get(p, 0) < cur:
                best[p] = cur
        if cur > ans:
            ans = cur
    print(ans)


main()

import sys


def main():
    data = sys.stdin.buffer.read().split()
    n = int(data[0])
    best = {}  # best[v] = longest valid subsequence (so far) whose last element is v
    get = best.get
    pows = [1 << k for k in range(31)]
    ans = 0
    for x in map(int, data[1:1 + n]):
        cur = get(x, 0)
        for p in pows:
            if p > x:
                break
            v = get(x - p, 0)
            if v > cur:
                cur = v
        cur += 1
        if cur > get(x, 0):
            best[x] = cur
        if cur > ans:
            ans = cur
    print(ans)


main()

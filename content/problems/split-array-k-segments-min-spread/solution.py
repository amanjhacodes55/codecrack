import sys


def main():
    data = sys.stdin.buffer.read().split()
    n, k = int(data[0]), int(data[1])
    a = list(map(int, data[2:2 + n]))
    INF = float("inf")
    # prev[i] = min cost to split a[:i] into (seg-1) segments ; start with 1 segment
    prev = [INF] * (n + 1)
    mx = mn = a[0]
    for i in range(1, n + 1):
        x = a[i - 1]
        if x > mx:
            mx = x
        if x < mn:
            mn = x
        prev[i] = mx - mn
    for seg in range(2, k + 1):
        cur = [INF] * (n + 1)
        for i in range(seg, n - (k - seg) + 1):
            best = INF
            hi = lo = a[i - 1]
            # last segment is a[j..i-1], j from i-1 down to seg-1
            for j in range(i - 1, seg - 2, -1):
                x = a[j]
                if x > hi:
                    hi = x
                elif x < lo:
                    lo = x
                v = prev[j] + hi - lo
                if v < best:
                    best = v
            cur[i] = best
        prev = cur
    print(prev[n])


main()

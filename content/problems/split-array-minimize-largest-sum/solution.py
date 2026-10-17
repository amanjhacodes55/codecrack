import sys


def parts_needed(a, cap):
    # greedy: minimum number of contiguous parts with every part sum <= cap
    parts, cur = 1, 0
    for x in a:
        if cur + x > cap:
            parts += 1
            cur = x
        else:
            cur += x
    return parts


def main():
    data = sys.stdin.read().split()
    n, k = int(data[0]), int(data[1])
    a = list(map(int, data[2:2 + n]))
    lo, hi = max(a), sum(a)
    while lo < hi:
        mid = (lo + hi) // 2
        if parts_needed(a, mid) <= k:
            hi = mid
        else:
            lo = mid + 1
    print(lo)


main()

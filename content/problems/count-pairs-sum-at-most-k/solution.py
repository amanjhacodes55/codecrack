import sys


def main():
    data = sys.stdin.read().split()
    n, k = int(data[0]), int(data[1])
    a = sorted(map(int, data[2:2 + n]))
    lo, hi = 0, n - 1
    ans = 0
    while lo < hi:
        if a[lo] + a[hi] <= k:
            ans += hi - lo      # a[lo] pairs with every index in (lo, hi]
            lo += 1
        else:
            hi -= 1
    print(ans)


main()

import sys


def main():
    data = sys.stdin.read().split()
    n, s = int(data[0]), int(data[1])
    a = list(map(int, data[2:2 + n]))
    best = n + 1
    left = 0
    window = 0
    for right in range(n):
        window += a[right]
        while window >= s:
            if right - left + 1 < best:
                best = right - left + 1
            window -= a[left]
            left += 1
    print(best if best <= n else 0)


main()

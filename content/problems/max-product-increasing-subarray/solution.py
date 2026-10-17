import sys

def main():
    data = sys.stdin.buffer.read().split()
    n = int(data[0])
    a = [int(x) for x in data[1:1 + n]]
    best = hi = lo = a[0]
    for i in range(1, n):
        x = a[i]
        if x <= a[i - 1]:
            hi = lo = x
        else:
            p, q = hi * x, lo * x
            hi = max(x, p, q)
            lo = min(x, p, q)
        if hi > best:
            best = hi
    print(best)

main()

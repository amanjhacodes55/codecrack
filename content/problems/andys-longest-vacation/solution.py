import sys

def main():
    data = sys.stdin.buffer.read().split()
    n, m, k = int(data[0]), int(data[1]), int(data[2])
    c = [0] * (n + 1)
    for i in range(3, 3 + m):
        c[int(data[i])] += 1
    left = 1
    s = 0
    best = 0
    for r in range(1, n + 1):
        s += c[r]
        while s > k:
            s -= c[left]
            left += 1
        if r - left + 1 > best:
            best = r - left + 1
    print(best)

main()

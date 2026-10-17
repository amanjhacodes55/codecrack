import sys

def main():
    data = sys.stdin.buffer.read().split()
    n = int(data[0])
    a = data[1:1 + 4 * n:2]
    b = data[2:2 + 4 * n:2]
    pairs = [(int(x), int(y)) for x, y in zip(a, b)]
    pairs.sort(key=lambda p: p[0] - p[1])
    total = sum(p[0] for p in pairs[:n]) + sum(p[1] for p in pairs[n:])
    print(total)

main()

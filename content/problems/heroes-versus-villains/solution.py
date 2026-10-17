import sys

def main():
    data = sys.stdin.buffer.read().split()
    n, m, h = int(data[0]), int(data[1]), int(data[2])
    v = [int(x) for x in data[3:3 + n]]
    total = sum(v)
    budget = m * h
    r = 0
    while total > budget:
        total -= v[r]
        r += 1
    print(r)

main()

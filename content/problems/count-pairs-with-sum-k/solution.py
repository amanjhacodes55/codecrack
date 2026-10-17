import sys


def main():
    data = sys.stdin.read().split()
    n, k = int(data[0]), int(data[1])
    seen = {}
    pairs = 0
    for tok in data[2:2 + n]:
        x = int(tok)
        pairs += seen.get(k - x, 0)   # partners strictly to the left
        seen[x] = seen.get(x, 0) + 1
    print(pairs)


main()

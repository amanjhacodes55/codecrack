import sys

def main():
    data = sys.stdin.buffer.read().split()
    n, k = int(data[0]), int(data[1])
    p = list(map(int, data[2:2 + n]))
    tree = [0] * (n + 1)

    def add(i, v):
        while i <= n:
            tree[i] += v
            i += i & -i

    def query(i):
        s = 0
        while i > 0:
            s += tree[i]
            i -= i & -i
        return s

    # total inversions
    total = 0
    for idx, x in enumerate(p):
        total += idx - query(x)
        add(x, 1)
    if k <= 1:
        print(total)
        return
    tree = [0] * (n + 1)
    # inversions inside first window
    inv = 0
    for idx in range(k):
        x = p[idx]
        inv += idx - query(x)
        add(x, 1)
    best = inv
    for l in range(n - k):
        x = p[l]
        add(x, -1)
        inv -= query(x - 1)              # elements in window smaller than x, after x
        y = p[l + k]
        inv += (k - 1) - query(y)        # elements in window greater than y, before y
        add(y, 1)
        if inv > best:
            best = inv
    pairs = k * (k - 1) // 2
    gain = 2 * best - pairs
    print(total - gain if gain > 0 else total)

main()

import sys

B = 31

def main():
    data = sys.stdin.buffer.read().split()
    n, k = int(data[0]), int(data[1])
    a = list(map(int, data[2:2 + n]))
    ones = [0] * B
    for v in a:
        b = 0
        while v:
            if v & 1:
                ones[b] += 1
            v >>= 1
            b += 1
    gain = [(n - 2 * ones[b]) << b for b in range(B)]
    base = sum(a)

    def value(x):
        s = base
        for b in range(B):
            if x >> b & 1:
                s += gain[b]
        return s

    best_x, best_v = k, value(k)
    for b in range(B):
        if k >> b & 1:
            x = (k >> (b + 1)) << (b + 1)        # keep higher bits, bit b = 0
            for t in range(b):
                if gain[t] > 0:
                    x |= 1 << t
            v = value(x)
            if v > best_v or (v == best_v and x < best_x):
                best_x, best_v = x, v
    print(best_x, best_v)

main()

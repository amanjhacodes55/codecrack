import sys

def main():
    data = sys.stdin.buffer.read().split()
    r, c = int(data[0]), int(data[1])
    g = [list(map(int, data[2 + i * c: 2 + (i + 1) * c])) for i in range(r)]
    best = None
    def upd(v):
        nonlocal best
        if best is None or v < best:
            best = v
    # horizontal
    for row in g:
        for j in range(c - 3):
            v = row[j]
            if v == row[j + 1] == row[j + 2] == row[j + 3]:
                upd(v)
    for i in range(r - 3):
        r0, r1, r2, r3 = g[i], g[i + 1], g[i + 2], g[i + 3]
        for j in range(c):
            v = r0[j]
            if v == r1[j] == r2[j] == r3[j]:          # vertical
                upd(v)
            if j + 3 < c and v == r1[j + 1] == r2[j + 2] == r3[j + 3]:   # down-right
                upd(v)
            if j >= 3 and v == r1[j - 1] == r2[j - 2] == r3[j - 3]:      # down-left
                upd(v)
    print(best if best is not None else -1)

main()

import sys
d = sys.stdin.read().split()
n, k = int(d[0]), int(d[1]); a = list(map(int, d[2:2 + n]))
bx, bv = None, None
for x in range(k + 1):
    v = sum(x ^ y for y in a)
    if bv is None or v > bv:
        bx, bv = x, v
print(bx, bv)

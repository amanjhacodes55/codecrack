import sys
d = sys.stdin.read().split()
a, b, k = d[0], d[1], int(d[2])

# enumerate every edit script (sequence of D / I / R steps) explicitly
scripts = []


def gen(i, j, ops):
    if i == len(a) and j == len(b):
        scripts.append(list(ops))
        return
    if i < len(a):
        ops.append(("D", i, j)); gen(i + 1, j, ops); ops.pop()
    if j < len(b):
        ops.append(("I", i, j)); gen(i, j + 1, ops); ops.pop()
    if i < len(a) and j < len(b):
        ops.append(("R", i, j)); gen(i + 1, j + 1, ops); ops.pop()


gen(0, 0, [])


def cost(op, inverted):
    t, i, j = op
    if t != "R":
        return 15
    x = abs(ord(a[i]) - ord(b[j]))
    if not inverted:
        return x
    return 25 if x == 0 else 25 - x


best = None
for s in scripts:
    # switch position p: steps [0, p) normal, [p, end) inverted ; p = len(s) means never switch
    for p in range(len(s) + 1):
        c = sum(cost(op, idx >= p) for idx, op in enumerate(s)) + (k if p < len(s) else 0)
        if best is None or c < best:
            best = c
print(best)

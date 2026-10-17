import sys
d = sys.stdin.read().split()
D, T = int(d[0]), int(d[1])
out = []
for t in range(T):
    lo, hi = int(d[2 + 2 * t]), int(d[3 + 2 * t])
    c = 0
    for x in range(lo, hi + 1):
        s = str(x)
        if any(s[i] == s[i + 1] for i in range(len(s) - 1)):
            continue
        if sum(map(int, s)) % D == 0:
            c += 1
    out.append(c)
print("\n".join(map(str, out)))

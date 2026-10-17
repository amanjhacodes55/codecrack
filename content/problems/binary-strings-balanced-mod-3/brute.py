import sys
d = sys.stdin.read().split()
t = int(d[0])
out = []
for q in map(int, d[1:1 + t]):
    c = 0
    for m in range(1 << q):
        s = format(m, "0%db" % q)
        if "11" in s:
            continue
        if (s.count("0") - s.count("1")) % 3 == 0:
            c += 1
    out.append(c % (10**9 + 7))
print("\n".join(map(str, out)))

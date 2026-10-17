import sys
d = sys.stdin.read().split()
n, D = int(d[0]), int(d[1]); a = list(map(int, d[2:2 + n]))
c = 0
for l in range(n):
    for r in range(l + 1, n):
        s = sorted(a[l:r + 1])
        if s[1] - s[0] <= D:
            c += 1
print(c % (10**9 + 7))

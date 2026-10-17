import sys
d = sys.stdin.read().split()
n, k = int(d[0]), int(d[1]); a = list(map(int, d[2:2 + n]))
c = 0
for i in range(n):
    s = 0
    for j in range(i, n):
        s += a[j]
        if s % k == 0:
            c += 1
print(c)

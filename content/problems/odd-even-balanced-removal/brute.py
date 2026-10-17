import sys
d = sys.stdin.read().split()
n = int(d[0]); a = list(map(int, d[1:1 + n]))
c = 0
for i in range(n):
    b = a[:i] + a[i + 1:]
    if sum(b[0::2]) == sum(b[1::2]):
        c += 1
print(c)

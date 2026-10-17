import sys
d = sys.stdin.read().split()
n, q = int(d[0]), int(d[1]); a = list(map(int, d[2:2+n]))
p = 2 + n
for _ in range(q):
    l, r = int(d[p]), int(d[p+1]); p += 2
    print(sum(a[l-1:r]))

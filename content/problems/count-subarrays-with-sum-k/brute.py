import sys
d = sys.stdin.read().split()
n, k = int(d[0]), int(d[1]); a = list(map(int, d[2:2+n]))
c = 0
for i in range(n):
    for j in range(i, n):
        if sum(a[i:j+1]) == k:
            c += 1
print(c)

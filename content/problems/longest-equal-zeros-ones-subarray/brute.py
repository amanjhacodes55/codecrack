import sys
d = sys.stdin.read().split()
n = int(d[0]); a = list(map(int, d[1:1+n]))
best = 0
for i in range(n):
    for j in range(i, n):
        seg = a[i:j+1]
        if seg.count(0) == seg.count(1):
            best = max(best, j - i + 1)
print(best)

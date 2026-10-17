import sys
d = sys.stdin.read().split()
n, s = int(d[0]), int(d[1]); a = list(map(int, d[2:2+n]))
best = 0
for i in range(n):
    for j in range(i, n):
        if sum(a[i:j+1]) >= s:
            if best == 0 or j - i + 1 < best:
                best = j - i + 1
            break
print(best)

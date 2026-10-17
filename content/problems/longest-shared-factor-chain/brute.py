import sys
from math import gcd
d = sys.stdin.read().split()
n = int(d[0]); a = list(map(int, d[1:1 + n]))
best = 0
for mask in range(1, 1 << n):
    s = [a[i] for i in range(n) if mask >> i & 1]
    if all(gcd(s[i], s[i + 1]) > 1 for i in range(len(s) - 1)):
        best = max(best, len(s))
print(best)

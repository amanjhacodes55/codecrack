import sys
from math import gcd
d = list(map(int, sys.stdin.read().split()))
n = d[0]; a = d[1:1+n]
print(sum(1 for i in range(n) for j in range(i+1, n) if gcd(a[i], a[j]) == 1))

import sys
from itertools import product
n, k = map(int, sys.stdin.read().split())
c = 0
for arr in product(range(1, n + 1), repeat=k):
    if all(arr[i + 1] % arr[i] == 0 for i in range(k - 1)):
        c += 1
print(c % (10**9 + 7))

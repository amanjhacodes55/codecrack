import sys
from itertools import permutations
s = sys.stdin.read().split()[0]
n = len(s)
best = 1
for p in set(permutations(s)):
    t = "".join(p)
    for k in range(1, n + 1):
        if n % k == 0:
            L = n // k
            if all(t[i * L:(i + 1) * L] == t[:L] for i in range(k)):
                best = max(best, k)
print(best)

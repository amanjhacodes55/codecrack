import sys
from itertools import permutations
d = sys.stdin.read().split()
n = int(d[0]); a = d[1:1 + n]
print(max(int("".join(p)) for p in permutations(a)))

import sys
from collections import Counter
d = sys.stdin.read().split()
n = int(d[0]); a = list(map(int, d[1:1+n]))
c = Counter(a)
ans = [x for x in c if c[x] * 2 > n]
print(ans[0] if ans else -1)

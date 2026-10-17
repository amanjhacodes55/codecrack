import sys
# Expand into individual bottles; on a line, matching the k-th supplied bottle
# with the k-th demanded bottle (both sorted by position) is optimal.
d = sys.stdin.read().split()
n = int(d[0]); a = list(map(int, d[1:1 + n]))
sup, dem = [], []
for i, x in enumerate(a):
    if x > 0: sup += [i] * x
    elif x < 0: dem += [i] * (-x)
assert len(sup) == len(dem)
print(sum(abs(p - q) for p, q in zip(sup, dem)))

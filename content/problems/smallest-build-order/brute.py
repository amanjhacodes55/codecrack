import sys
from itertools import permutations
d = list(map(int, sys.stdin.read().split()))
n, m = d[0], d[1]
edges = [(d[2+2*i], d[3+2*i]) for i in range(m)]
for perm in permutations(range(1, n + 1)):  # lexicographic order
    pos = {v: i for i, v in enumerate(perm)}
    if all(pos[u] < pos[v] for u, v in edges):
        print(*perm); break
else:
    print(-1)

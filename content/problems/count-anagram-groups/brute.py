import sys
d = sys.stdin.read().split()
n = int(d[0]); w = d[1:1+n]
from collections import Counter
# union-find style grouping by explicit pairwise comparison of letter counts
group = list(range(n))
for i in range(n):
    for j in range(i):
        if Counter(w[i]) == Counter(w[j]):
            group[i] = group[j]
            break
sizes = Counter(group)
print(len(sizes), max(sizes.values()))

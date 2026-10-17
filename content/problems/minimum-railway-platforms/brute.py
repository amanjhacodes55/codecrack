import sys
d = sys.stdin.read().split()
n = int(d[0])
tr = [(int(d[1 + 2 * i]), int(d[2 + 2 * i])) for i in range(n)]
print(max(sum(1 for a, b in tr if a <= t <= b) for t, _ in tr))

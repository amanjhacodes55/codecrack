import sys
s = sys.stdin.read().split()[0]
n = len(s)
for k in range(n, 0, -1):
    p = s[:k]
    if p == p[::-1]:
        print(n - k)
        break

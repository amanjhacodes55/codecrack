import sys
s = sys.stdin.readline().strip(); n = len(s)
for L in range(n - 1, 0, -1):
    t = s[:L]
    if s.endswith(t) and t in s[1:n-1]:
        print(t); break
else:
    print(-1)

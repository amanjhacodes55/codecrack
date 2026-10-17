import sys
MOD = 10**9 + 7
d = sys.stdin.read().split()
t = int(d[0])
for i in range(t):
    a, n = int(d[1+2*i]), int(d[2+2*i])
    s, term = 0, 1
    for _ in range(n):
        s += term
        term *= a
    print(s % MOD)

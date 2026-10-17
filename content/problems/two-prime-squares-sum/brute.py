import sys
d = sys.stdin.read().split()
t = int(d[0])
def isp(v):
    return v >= 2 and all(v % q for q in range(2, int(v ** 0.5) + 1))
for x in d[1:1 + t]:
    n = int(x)
    best = -1
    a = 1
    while a * a <= n:
        for b in range(1, a + 1):
            if a * a + b * b == n and isp(a) and isp(b):
                if best == -1 or a + b < best:
                    best = a + b
        a += 1
    print(best)

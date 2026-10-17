import sys
d = sys.stdin.read().split()
n = int(d[0])
for k in range(n):
    s = list(d[1 + 2 * k]); x = int(d[2 + 2 * k])
    t = 0
    while True:
        t += (x % 10) ** 2
        x //= 10
        if x == 0:
            break
    if t % 2 == 0:
        s = [s[-1]] + s[:-1]
    else:
        for _ in range(2):
            s = s[1:] + [s[0]]
    print("".join(s))

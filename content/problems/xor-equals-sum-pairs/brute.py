import sys
d = sys.stdin.read().split()
t = int(d[0])
for q in d[1:1 + t]:
    x = int(q, 2)
    c = 0
    for i in range(x + 1):
        for j in range(x + 1 - i):
            if i ^ j == x:
                c += 1
    print(c % (10**9 + 7))

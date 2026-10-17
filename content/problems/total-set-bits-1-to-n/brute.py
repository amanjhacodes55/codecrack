import sys
d = sys.stdin.read().split()
t = int(d[0])
for x in d[1:1+t]:
    n = int(x)
    print(sum(bin(i).count("1") for i in range(1, n + 1)))

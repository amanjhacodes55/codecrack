import sys
d = sys.stdin.read().split()
t = int(d[0])
for x in d[1:1 + t]:
    n = int(x)
    if n == 1:
        print("INFINITY"); continue
    cnt = 0
    for b in range(2, n + 2):
        m = n
        lead = 0
        while m:
            lead = m % b
            m //= b
        if n > 0 and lead == 1:
            cnt += 1
    print(cnt)

import sys
d = sys.stdin.read().split()
n = int(d[0]); a = list(map(int, d[1:1 + n]))


def ok(diff):
    return diff == 0 or (diff > 0 and diff & (diff - 1) == 0)


best = 0
for mask in range(1, 1 << n):
    s = [a[i] for i in range(n) if mask >> i & 1]
    if all(ok(s[i + 1] - s[i]) for i in range(len(s) - 1)):
        best = max(best, len(s))
print(best)

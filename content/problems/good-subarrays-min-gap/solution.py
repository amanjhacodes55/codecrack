import sys
from bisect import bisect_right

MOD = 10**9 + 7

def nearest_left(a, d):
    """for each p: largest i < p with a[i] <= a[p] + d, else -1"""
    st_idx, st_val = [], []
    res = [0] * len(a)
    for p, v in enumerate(a):
        k = bisect_right(st_val, v + d) - 1
        res[p] = st_idx[k] if k >= 0 else -1
        while st_val and st_val[-1] >= v:
            st_val.pop(); st_idx.pop()
        st_idx.append(p); st_val.append(v)
    return res

def main():
    data = sys.stdin.buffer.read().split()
    n, d = int(data[0]), int(data[1])
    a = list(map(int, data[2:2 + n]))
    left = nearest_left(a, d)
    right_rev = nearest_left(a[::-1], d)
    bad = 0
    for p in range(n):
        L = left[p]
        r = right_rev[n - 1 - p]
        R = n - 1 - r if r != -1 else n
        bad += (p - L) * (R - p) - 1
    total = n * (n - 1) // 2
    print((total - bad) % MOD)

main()

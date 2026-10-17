import sys
d = sys.stdin.read().split()
n = int(d[0]); a = list(map(int, d[1:1 + n]))


def go(piles):  # try every possible order of merges (no memoisation)
    if len(piles) == 1:
        return 0
    best = None
    for i in range(len(piles) - 1):
        s = piles[i] + piles[i + 1]
        c = s + go(piles[:i] + [s] + piles[i + 2:])
        if best is None or c < best:
            best = c
    return best


print(go(a))

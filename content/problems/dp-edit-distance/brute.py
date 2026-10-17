import sys
sys.setrecursionlimit(10000)
d = sys.stdin.read().split()
s, t = d[0], d[1]


def f(i, j):  # plain exponential recursion, no memo
    if i == len(s):
        return len(t) - j
    if j == len(t):
        return len(s) - i
    best = min(1 + f(i + 1, j), 1 + f(i, j + 1), (s[i] != t[j]) + f(i + 1, j + 1))
    return best


print(f(0, 0))

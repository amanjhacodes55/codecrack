import sys
s, t = sys.stdin.read().split()[:2]
print("YES" if sorted(s) == sorted(t) else "NO")

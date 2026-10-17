import sys
s = sys.stdin.readline().strip()
# sort each character individually by (−count, char)
print("".join(sorted(s, key=lambda c: (-s.count(c), ord(c)))))

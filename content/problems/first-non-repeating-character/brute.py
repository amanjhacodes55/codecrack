import sys
s = sys.stdin.readline().strip()
ans = -1
for i in range(len(s)):
    if s.count(s[i]) == 1:
        ans = i
        break
print(ans)

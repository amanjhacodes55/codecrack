import sys, re
line = sys.stdin.readline().rstrip("\n").lower()
words = re.findall(r"[a-z]+", line)
best = None
for w in sorted(set(words)):
    if best is None or words.count(w) > words.count(best):
        best = w
print(best)

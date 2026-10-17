import sys


def main():
    lines = sys.stdin.read().split()
    s, t = lines[0], lines[1]
    if len(s) != len(t):
        print("NO")
        return
    cnt = [0] * 26
    for ch in s:
        cnt[ord(ch) - 97] += 1
    for ch in t:
        cnt[ord(ch) - 97] -= 1
    print("YES" if all(c == 0 for c in cnt) else "NO")


main()

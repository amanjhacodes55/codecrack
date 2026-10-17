import sys


def main():
    s = sys.stdin.readline().strip()
    cnt = {}
    for ch in s:
        cnt[ch] = cnt.get(ch, 0) + 1
    for i, ch in enumerate(s):
        if cnt[ch] == 1:
            print(i)
            return
    print(-1)


main()

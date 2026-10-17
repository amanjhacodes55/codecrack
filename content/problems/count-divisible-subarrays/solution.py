import sys

def main():
    data = sys.stdin.buffer.read().split()
    n, k = int(data[0]), int(data[1])
    cnt = {0: 1}
    s = 0
    ans = 0
    for i in range(2, 2 + n):
        s = (s + int(data[i])) % k
        c = cnt.get(s, 0)
        ans += c
        cnt[s] = c + 1
    print(ans)

main()

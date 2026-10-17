import sys

def main():
    data = sys.stdin.read().split()
    n = int(data[0])
    a = data[1:1 + n]
    # Boyer-Moore voting, then verify
    cand, cnt = None, 0
    for x in a:
        if cnt == 0:
            cand, cnt = x, 1
        elif x == cand:
            cnt += 1
        else:
            cnt -= 1
    if cand is not None and a.count(cand) * 2 > n:
        print(int(cand))
    else:
        print(-1)

main()

import sys

def main():
    data = sys.stdin.buffer.read().split()
    e, n = int(data[0]), int(data[1])
    a = sorted((int(x) for x in data[2:2 + n]), reverse=True)
    if 2 * sum(a) < e:
        print(-1)
        return
    done = 0
    cnt = 0
    for x in a:
        for _ in range(2):
            done += x
            cnt += 1
            if done >= e:
                print(cnt)
                return

main()

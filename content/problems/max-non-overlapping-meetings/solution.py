import sys


def main():
    data = sys.stdin.buffer.read().split()
    n = int(data[0])
    meetings = [(int(data[2 + 2 * i]), int(data[1 + 2 * i])) for i in range(n)]  # (end, start)
    meetings.sort()
    count = 0
    free_at = -1
    for e, s in meetings:
        if s >= free_at:
            count += 1
            free_at = e
    print(count)


main()

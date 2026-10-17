import sys


def main():
    data = sys.stdin.buffer.read().split()
    n = int(data[0])
    a = list(map(int, data[1:1 + n]))
    take, skip = 0, 0  # best ending with a[i] taken / not taken (empty allowed)
    for x in a:
        take, skip = skip + x, max(take, skip)
    print(max(take, skip))


main()

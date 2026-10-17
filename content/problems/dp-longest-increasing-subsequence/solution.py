import sys
from bisect import bisect_left


def main():
    data = sys.stdin.buffer.read().split()
    n = int(data[0])
    tails = []  # tails[k] = smallest possible tail of a strictly increasing subsequence of length k+1
    for x in map(int, data[1:1 + n]):
        k = bisect_left(tails, x)
        if k == len(tails):
            tails.append(x)
        else:
            tails[k] = x
    print(len(tails))


main()

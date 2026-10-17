import sys


def main():
    data = sys.stdin.read().split()
    n = int(data[0])
    a = data[1:1 + n]
    first = {0: -1}  # prefix value -> first index where it was seen
    pref = 0
    best = 0
    for i in range(n):
        pref += 1 if a[i] == "1" else -1
        if pref in first:
            length = i - first[pref]
            if length > best:
                best = length
        else:
            first[pref] = i
    print(best)


main()

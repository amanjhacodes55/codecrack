import sys


def main():
    data = sys.stdin.read().split()
    n, k = int(data[0]), int(data[1])
    freq = {0: 1}  # prefix sum value -> how many prefixes have it (empty prefix included)
    pref = 0
    ans = 0
    for tok in data[2:2 + n]:
        pref += int(tok)
        ans += freq.get(pref - k, 0)
        freq[pref] = freq.get(pref, 0) + 1
    print(ans)


main()

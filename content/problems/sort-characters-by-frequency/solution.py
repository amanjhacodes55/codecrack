import sys


def main():
    s = sys.stdin.readline().strip()
    freq = {}
    for ch in s:
        freq[ch] = freq.get(ch, 0) + 1
    # higher frequency first, ties -> smaller ASCII code first
    order = sorted(freq, key=lambda c: (-freq[c], c))
    print("".join(c * freq[c] for c in order))


main()

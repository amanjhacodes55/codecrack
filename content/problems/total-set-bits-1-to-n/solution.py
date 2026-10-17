import sys


def total_bits(n):
    # count of set bits over all integers 0..n, bit position by bit position
    total = 0
    k = 0
    m = n + 1  # numbers 0..n
    while (1 << k) <= n:
        cycle = 1 << (k + 1)
        half = 1 << k
        total += (m // cycle) * half + max(0, m % cycle - half)
        k += 1
    return total


def main():
    data = sys.stdin.read().split()
    t = int(data[0])
    out = [total_bits(int(x)) for x in data[1:1 + t]]
    sys.stdout.write("\n".join(map(str, out)) + "\n")


main()

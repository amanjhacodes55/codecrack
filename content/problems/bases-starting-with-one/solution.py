import sys

def iroot(n, k):
    """largest b >= 0 with b**k <= n"""
    if n < 2:
        return n
    b = int(round(n ** (1.0 / k)))
    while b ** k > n:
        b -= 1
    while (b + 1) ** k <= n:
        b += 1
    return b

def count(n):
    if n == 1:
        return "INFINITY"
    if n == 0:
        return "0"
    total = n - n // 2          # k = 1: bases in (n/2, n]
    half = n // 2
    k = 2
    while (1 << k) <= n:
        hi = iroot(n, k)
        lo = max(iroot(half, k) + 1, 2)
        if hi >= lo:
            total += hi - lo + 1
        k += 1
    return str(total)

def main():
    data = sys.stdin.read().split()
    t = int(data[0])
    print("\n".join(count(int(x)) for x in data[1:1 + t]))

main()

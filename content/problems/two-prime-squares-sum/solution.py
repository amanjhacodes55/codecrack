import sys
from math import isqrt

LIM = 100001

def sieve(n):
    s = bytearray([1]) * (n + 1)
    s[0] = s[1] = 0
    for i in range(2, isqrt(n) + 1):
        if s[i]:
            s[i * i::i] = bytearray(len(range(i * i, n + 1, i)))
    return s

def main():
    data = sys.stdin.read().split()
    t = int(data[0])
    s = sieve(LIM)
    primes = [i for i in range(LIM + 1) if s[i]]
    out = []
    for x in data[1:1 + t]:
        n = int(x)
        ans = -1
        # smallest X gives the smallest X + Y (X^2 + Y^2 fixed)
        for p in primes:
            rest = n - p * p
            if rest < p * p:
                break
            y = isqrt(rest)
            if y * y == rest and s[y]:
                ans = p + y
                break
        out.append(str(ans))
    print("\n".join(out))

main()

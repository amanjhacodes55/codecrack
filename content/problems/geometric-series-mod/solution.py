import sys

MOD = 10**9 + 7


def power(base, exp, mod):
    result = 1
    base %= mod
    while exp > 0:
        if exp & 1:
            result = result * base % mod
        base = base * base % mod
        exp >>= 1
    return result


def series(a, n):
    a %= MOD
    if a == 1:
        return n % MOD
    # (a^n - 1) / (a - 1), division via Fermat inverse since MOD is prime
    num = (power(a, n, MOD) - 1) % MOD
    return num * power(a - 1, MOD - 2, MOD) % MOD


def main():
    data = sys.stdin.read().split()
    t = int(data[0])
    out = []
    for i in range(t):
        a, n = int(data[1 + 2 * i]), int(data[2 + 2 * i])
        out.append(series(a, n))
    sys.stdout.write("\n".join(map(str, out)) + "\n")


main()

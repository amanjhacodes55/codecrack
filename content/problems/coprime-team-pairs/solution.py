import sys

def main():
    data = sys.stdin.buffer.read().split()
    n = int(data[0])
    a = list(map(int, data[1:1 + n]))
    M = max(a)
    freq = [0] * (M + 1)
    for x in a:
        freq[x] += 1
    # Mobius via linear sieve
    mu = [0] * (M + 1)
    mu[1] = 1 if M >= 1 else 0
    is_comp = bytearray(M + 1)
    primes = []
    for i in range(2, M + 1):
        if not is_comp[i]:
            primes.append(i); mu[i] = -1
        for p in primes:
            ip = i * p
            if ip > M:
                break
            is_comp[ip] = 1
            if i % p == 0:
                mu[ip] = 0
                break
            mu[ip] = -mu[i]
    ans = 0
    for d in range(1, M + 1):
        if mu[d]:
            c = sum(freq[d::d])
            ans += mu[d] * (c * (c - 1) // 2)
    print(ans)

main()

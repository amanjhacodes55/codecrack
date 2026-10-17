import sys

MAXLEN = 19


def main():
    data = sys.stdin.read().split()
    D, T = int(data[0]), int(data[1])
    # f[l][r][d]: digit strings of length l starting with digit d, no two equal adjacent digits,
    #             digit sum ≡ r (mod D)
    f = [[[0] * 10 for _ in range(D)]]
    f.append([[0] * 10 for _ in range(D)])
    for d in range(10):
        f[1][d % D][d] += 1
    for l in range(2, MAXLEN + 1):
        prev = f[l - 1]
        # tot[r] = sum over all first digits; then subtract the forbidden one
        tot = [sum(row) for row in prev]
        cur = [[0] * 10 for _ in range(D)]
        for r in range(D):
            for d in range(10):
                rr = (r - d) % D
                cur[r][d] = tot[rr] - prev[rr][d]
        f.append(cur)

    # g(l, need, last): strings of length l whose first digit != last, sum ≡ need
    def g(l, need, last):
        if l == 0:
            return 1 if need % D == 0 else 0
        row = f[l][need % D]
        return sum(row) - (row[last] if last >= 0 else 0)

    def count_upto(x):  # numbers in [1, x] satisfying the property
        if x <= 0:
            return 0
        s = str(x)
        L = len(s)
        res = 0
        for l in range(1, L):  # shorter numbers: first digit 1..9
            for d in range(1, 10):
                res += g(l - 1, -d, d)
        prev, acc = -1, 0
        for p in range(L):
            lim = int(s[p])
            for d in range(1 if p == 0 else 0, lim):
                if d != prev:
                    res += g(L - p - 1, -(acc + d), d)
            if lim == prev:
                return res
            prev = lim
            acc += lim
        if acc % D == 0:
            res += 1
        return res

    out = []
    for t in range(T):
        lo, hi = int(data[2 + 2 * t]), int(data[3 + 2 * t])
        out.append(count_upto(hi) - count_upto(lo - 1))
    print("\n".join(map(str, out)))


main()

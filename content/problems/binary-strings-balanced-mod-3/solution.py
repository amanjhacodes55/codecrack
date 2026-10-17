import sys

MOD = 10**9 + 7


def main():
    data = sys.stdin.buffer.read().split()
    t = int(data[0])
    qs = [int(x) for x in data[1:1 + t]]
    mx = max(qs)
    # z[d] = strings ending in '0' with (zeros - ones) % 3 == d ; o[d] = ending in '1'
    z = [0, 1, 0]
    o = [0, 0, 1]
    ans = [0] * (mx + 1)
    ans[1] = (z[0] + o[0]) % MOD
    for n in range(2, mx + 1):
        # append '0' to anything: d -> d+1 ; append '1' only after '0': d -> d-1
        nz = [(z[2] + o[2]) % MOD, (z[0] + o[0]) % MOD, (z[1] + o[1]) % MOD]
        no = [z[1], z[2], z[0]]
        z, o = nz, no
        ans[n] = (z[0] + o[0]) % MOD
    sys.stdout.write("\n".join(str(ans[q]) for q in qs) + "\n")


main()

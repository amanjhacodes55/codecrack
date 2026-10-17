import sys

def main():
    data = sys.stdin.read().split()
    n = int(data[0])
    out = []
    for k in range(n):
        s = data[1 + 2 * k]
        x = data[2 + 2 * k]
        total = sum(int(c) ** 2 for c in x)
        L = len(s)
        if total % 2 == 0:
            r = 1 % L
            out.append(s[L - r:] + s[:L - r])
        else:
            r = 2 % L
            out.append(s[r:] + s[:r])
    print("\n".join(out))

main()

import sys


def main():
    data = sys.stdin.read().split()
    s, t = data[0], data[1]
    m = len(t)
    prev = list(range(m + 1))  # prev[j] = distance(s[:i-1], t[:j])
    for i, a in enumerate(s, 1):
        cur = [i] + [0] * m
        for j in range(1, m + 1):
            if a == t[j - 1]:
                cur[j] = prev[j - 1]
            else:
                x = prev[j - 1]
                y = prev[j]
                z = cur[j - 1]
                if y < x:
                    x = y
                if z < x:
                    x = z
                cur[j] = x + 1
        prev = cur
    print(prev[m])


main()

import sys

INDEL = 15


def main():
    data = sys.stdin.read().split()
    a, b, k = data[0], data[1], int(data[2])
    n, m = len(a), len(b)
    pa = [ord(ch) - 97 for ch in a]
    pb = [ord(ch) - 97 for ch in b]
    INF = float("inf")
    # f0[i][j]: consumed a[:i], wrote b[:j], still in Normal mode
    # f1[i][j]: same, already switched to Inverted mode
    f0 = [[INF] * (m + 1) for _ in range(n + 1)]
    f1 = [[INF] * (m + 1) for _ in range(n + 1)]
    f0[0][0] = 0
    for i in range(n + 1):
        r0, r1 = f0[i], f1[i]
        for j in range(m + 1):
            v0 = r0[j]
            if v0 + k < r1[j]:  # switch here (only once, never back)
                r1[j] = v0 + k
            v1 = r1[j]
            if i < n:  # delete a[i]
                if v0 + INDEL < f0[i + 1][j]:
                    f0[i + 1][j] = v0 + INDEL
                if v1 + INDEL < f1[i + 1][j]:
                    f1[i + 1][j] = v1 + INDEL
            if j < m:  # insert b[j]
                if v0 + INDEL < r0[j + 1]:
                    r0[j + 1] = v0 + INDEL
                if v1 + INDEL < r1[j + 1]:
                    r1[j + 1] = v1 + INDEL
            if i < n and j < m:  # replace a[i] -> b[j]
                d = abs(pa[i] - pb[j])
                c0 = d
                c1 = 25 if d == 0 else 25 - d
                if v0 + c0 < f0[i + 1][j + 1]:
                    f0[i + 1][j + 1] = v0 + c0
                if v1 + c1 < f1[i + 1][j + 1]:
                    f1[i + 1][j + 1] = v1 + c1
    print(min(f0[n][m], f1[n][m]))


main()

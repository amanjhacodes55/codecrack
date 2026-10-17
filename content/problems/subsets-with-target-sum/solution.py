import sys


def main():
    data = sys.stdin.read().split()
    n, t = int(data[0]), int(data[1])
    a = sorted(map(int, data[2:2 + n]))
    res = []
    path = []

    def dfs(start, remaining):
        if remaining == 0:
            res.append(" ".join(map(str, path)))
            return
        for j in range(start, n):
            if a[j] > remaining:
                break  # sorted: every later value is larger too
            path.append(a[j])
            dfs(j + 1, remaining - a[j])
            path.pop()

    dfs(0, t)
    out = [str(len(res))] + res
    sys.stdout.write("\n".join(out) + "\n")


main()

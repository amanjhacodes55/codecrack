import sys


def main():
    line = sys.stdin.readline().rstrip("\n").lower()
    count = {}
    cur = []
    for ch in line + " ":
        if "a" <= ch <= "z":
            cur.append(ch)
        elif cur:
            w = "".join(cur)
            count[w] = count.get(w, 0) + 1
            cur = []
    best = min(count, key=lambda w: (-count[w], w))
    print(best)


main()

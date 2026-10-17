import sys


def main():
    data = sys.stdin.read().split()
    n = int(data[0])
    groups = {}
    for w in data[1:1 + n]:
        key = "".join(sorted(w))
        groups[key] = groups.get(key, 0) + 1
    print(len(groups), max(groups.values()))


main()

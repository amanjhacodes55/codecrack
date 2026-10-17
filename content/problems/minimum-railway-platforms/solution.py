import sys

def main():
    data = sys.stdin.buffer.read().split()
    n = int(data[0])
    arr = sorted(int(x) for x in data[1:1 + 2 * n:2])
    dep = sorted(int(x) for x in data[2:2 + 2 * n:2])
    i = j = cur = best = 0
    while i < n:
        if arr[i] <= dep[j]:
            cur += 1
            i += 1
            if cur > best:
                best = cur
        else:
            cur -= 1
            j += 1
    print(best)

main()

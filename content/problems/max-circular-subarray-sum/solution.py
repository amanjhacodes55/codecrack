import sys

def main():
    data = sys.stdin.buffer.read().split()
    n = int(data[0])
    a = [int(x) for x in data[1:1 + n]]
    total = 0
    cur_max = cur_min = 0
    best_max = -float("inf")
    best_min = float("inf")
    for x in a:
        total += x
        cur_max = x if cur_max < 0 else cur_max + x
        cur_min = x if cur_min > 0 else cur_min + x
        if cur_max > best_max: best_max = cur_max
        if cur_min < best_min: best_min = cur_min
    if best_max < 0:
        print(best_max)
    else:
        print(max(best_max, total - best_min))

main()

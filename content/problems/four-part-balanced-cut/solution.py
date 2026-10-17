import sys

def main():
    data = sys.stdin.buffer.read().split()
    n = int(data[0])
    a = list(map(int, data[1:1 + n]))
    pre = [0] * (n + 1)
    for i, x in enumerate(a):
        pre[i + 1] = pre[i] + x
    total = pre[n]
    best = None
    i = 1          # first cut: parts [0,i) and [i,mid)
    j = 3          # third cut: parts [mid,j) and [j,n)
    for mid in range(2, n - 1):
        # move i while it makes the two left parts closer
        while i + 1 < mid and abs(pre[mid] - 2 * pre[i + 1]) <= abs(pre[mid] - 2 * pre[i]):
            i += 1
        if j <= mid:
            j = mid + 1
        while j + 1 < n and abs(total + pre[mid] - 2 * pre[j + 1]) <= abs(total + pre[mid] - 2 * pre[j]):
            j += 1
        p, q, r, s = pre[i], pre[mid] - pre[i], pre[j] - pre[mid], total - pre[j]
        diff = max(p, q, r, s) - min(p, q, r, s)
        if best is None or diff < best:
            best = diff
    print(best)

main()

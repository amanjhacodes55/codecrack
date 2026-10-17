import sys

def main():
    data = sys.stdin.buffer.read().split()
    n, m = int(data[0]), int(data[1])
    cnt = [0] * (m + 3)
    for x in data[2:2 + n]:
        cnt[int(x)] += 1
    NEG = -1
    # dp[j][k]: j runs started at v-2, k runs started at v-1 (each 0..2)
    dp = [[NEG] * 3 for _ in range(3)]
    dp[0][0] = 0
    for v in range(1, m + 3):
        c = cnt[v]
        new = [[NEG] * 3 for _ in range(3)]
        for j in range(3):
            row = dp[j]
            for k in range(3):
                cur = row[k]
                if cur < 0:
                    continue
                for l in range(3):
                    used = j + k + l
                    if used > c:
                        break
                    val = cur + l + (c - used) // 3
                    if val > new[k][l]:
                        new[k][l] = val
        dp = new
    print(dp[0][0])

main()

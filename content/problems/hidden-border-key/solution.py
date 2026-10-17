import sys

def main():
    s = sys.stdin.readline().strip()
    n = len(s)
    pi = [0] * n
    k = 0
    for i in range(1, n):
        c = s[i]
        while k and s[k] != c:
            k = pi[k - 1]
        if s[k] == c:
            k += 1
        pi[i] = k
    cand = pi[n - 1] if n else 0
    if cand and n >= 2 and max(pi[:n - 1]) >= cand:
        print(s[:cand]); return
    if cand:
        cand = pi[cand - 1]
        if cand:
            print(s[:cand]); return
    print(-1)

main()

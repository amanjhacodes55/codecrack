import sys

def main():
    s = sys.stdin.read().split()[0]
    x = s + "#" + s[::-1]
    m = len(x)
    pi = [0] * m
    for i in range(1, m):
        j = pi[i - 1]
        c = x[i]
        while j and c != x[j]:
            j = pi[j - 1]
        if c == x[j]:
            j += 1
        pi[i] = j
    print(len(s) - pi[-1])

main()

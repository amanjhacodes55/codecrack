import sys
from math import gcd

def main():
    s = sys.stdin.read().split()[0]
    g = 0
    for ch in set(s):
        g = gcd(g, s.count(ch))
    print(g)

main()

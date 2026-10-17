import sys
from functools import cmp_to_key

def cmp(x, y):
    a, b = x + y, y + x
    return -1 if a > b else (1 if a < b else 0)

def main():
    data = sys.stdin.read().split()
    n = int(data[0])
    s = data[1:1 + n]
    s = [str(int(x)) for x in s]
    s.sort(key=cmp_to_key(cmp))
    res = "".join(s)
    print("0" if res[0] == "0" else res)

main()

import sys

MOD = 10**9 + 7

def main():
    data = sys.stdin.read().split()
    t = int(data[0])
    print("\n".join(str(pow(2, q.count("1"), MOD)) for q in data[1:1 + t]))

main()

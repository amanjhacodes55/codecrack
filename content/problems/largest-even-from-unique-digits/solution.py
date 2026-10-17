import sys

def best(s):
    digits = sorted({c for c in s if c.isdigit()}, reverse=True)
    evens = [d for d in digits if int(d) % 2 == 0]
    if not evens:
        return "-1"
    last = min(evens)
    digits.remove(last)
    return "".join(digits) + last

def main():
    data = sys.stdin.read().split()
    t = int(data[0])
    print("\n".join(best(data[1 + i]) for i in range(t)))

main()

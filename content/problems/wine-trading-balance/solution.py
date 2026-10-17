import sys

def main():
    data = sys.stdin.buffer.read().split()
    n = int(data[0])
    carry = 0
    work = 0
    for i in range(1, n + 1):
        carry += int(data[i])
        work += carry if carry >= 0 else -carry
    print(work)

main()

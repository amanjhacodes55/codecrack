import sys

def main():
    data = sys.stdin.buffer.read().split()
    n = int(data[0])
    a = [int(x) for x in data[1:1 + n]]
    tot_odd = sum(a[0::2])   # positions 1,3,5,...
    tot_even = sum(a[1::2])  # positions 2,4,6,...
    pre_odd = pre_even = 0
    cnt = 0
    for i in range(n):
        x = a[i]
        if i % 2 == 0:  # position i+1 is odd
            suf_odd = tot_odd - pre_odd - x
            suf_even = tot_even - pre_even
        else:
            suf_odd = tot_odd - pre_odd
            suf_even = tot_even - pre_even - x
        if pre_odd + suf_even == pre_even + suf_odd:
            cnt += 1
        if i % 2 == 0:
            pre_odd += x
        else:
            pre_even += x
    print(cnt)

main()

import sys

def main():
    data = sys.stdin.read().split()
    s = data[0]
    k = int(data[1])
    st = []
    for ch in s:
        while k and st and st[-1] < ch:
            st.pop()
            k -= 1
        st.append(ch)
    if k:
        st = st[:-k]
    res = "".join(st).lstrip("0")
    print(res if res else "0")

main()

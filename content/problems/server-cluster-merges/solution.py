import sys

def main():
    data = sys.stdin.buffer.read().split()
    n, q = int(data[0]), int(data[1])
    parent = list(range(n + 1))
    size = [1] * (n + 1)
    comps = n

    def find(x):
        root = x
        while parent[root] != root:
            root = parent[root]
        while parent[x] != root:
            parent[x], x = root, parent[x]
        return root

    out = []
    p = 2
    for _ in range(q):
        t = data[p]; p += 1
        if t == b'1':
            a = find(int(data[p])); b = find(int(data[p + 1])); p += 2
            if a != b:
                if size[a] < size[b]:
                    a, b = b, a
                parent[b] = a
                size[a] += size[b]
                comps -= 1
        elif t == b'2':
            a = find(int(data[p])); b = find(int(data[p + 1])); p += 2
            out.append("YES" if a == b else "NO")
        elif t == b'3':
            out.append(str(size[find(int(data[p]))])); p += 1
        else:
            out.append(str(comps))
    sys.stdout.write("\n".join(out) + ("\n" if out else ""))

main()

import sys

def main():
    data = sys.stdin.buffer.read().split()
    r, c = int(data[0]), int(data[1])
    h = list(map(int, data[2:2 + r * c]))
    n = r * c
    if n == 1:
        print(0); return
    edges = []
    for i in range(r):
        base = i * c
        for j in range(c):
            u = base + j
            if j + 1 < c:
                edges.append((abs(h[u] - h[u + 1]), u, u + 1))
            if i + 1 < r:
                edges.append((abs(h[u] - h[u + c]), u, u + c))
    edges.sort()
    parent = list(range(n))
    def find(x):
        root = x
        while parent[root] != root:
            root = parent[root]
        while parent[x] != root:
            parent[x], x = root, parent[x]
        return root
    target = n - 1
    for w, u, v in edges:
        a = find(u); b = find(v)
        if a != b:
            parent[a] = b
            if find(0) == find(target):
                print(w); return

main()

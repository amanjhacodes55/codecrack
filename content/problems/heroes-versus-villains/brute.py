import sys
d = sys.stdin.read().split()
n, m, H = int(d[0]), int(d[1]), int(d[2])
V = list(map(int, d[3:3 + n]))

def heroes_win(vs):
    vs = list(vs)
    heroes = [H] * m
    i = j = 0
    while i < len(heroes) and j < len(vs):
        h, v = heroes[i], vs[j]
        if h > v:
            heroes[i] = h - v; j += 1
        elif h < v:
            vs[j] = v - h; i += 1
        else:
            i += 1; j += 1
    return j == len(vs)

for R in range(n + 1):
    if heroes_win(V[R:]):
        print(R)
        break

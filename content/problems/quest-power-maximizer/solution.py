import sys
import heapq

def main():
    data = sys.stdin.buffer.read().split()
    n, k, power = int(data[0]), int(data[1]), int(data[2])
    req = data[3:3 + n]
    gain = data[3 + n:3 + 2 * n]
    quests = sorted(zip(map(int, req), map(int, gain)))
    heap = []
    i = 0
    for _ in range(k):
        while i < n and quests[i][0] <= power:
            heapq.heappush(heap, -quests[i][1]); i += 1
        if not heap:
            break
        power -= heapq.heappop(heap)
    print(power)

main()

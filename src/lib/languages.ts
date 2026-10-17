export type LanguageId = "python" | "cpp" | "java";

export const LANGUAGES: Record<LanguageId, { id: LanguageId; label: string; monaco: string; version: string }> = {
  python: { id: "python", label: "Python 3", monaco: "python", version: "Python 3.12" },
  cpp: { id: "cpp", label: "C++17", monaco: "cpp", version: "g++ -O2 -std=c++17" },
  java: { id: "java", label: "Java", monaco: "java", version: "Java 17+" },
};

export const DEFAULT_STARTERS: Record<LanguageId, string> = {
  python: `import sys


def main():
    data = sys.stdin.read().split()
    # Write your code here


if __name__ == "__main__":
    main()
`,
  cpp: `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    // Write your code here

    return 0;
}
`,
  java: `import java.util.*;
import java.io.*;

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        // Write your code here
    }
}
`,
};

# CodeCrack problem format

Every problem lives in `content/problems/<slug>/` (slug = lowercase-kebab-case, unique).
Use `content/problems/majority-element/` as the reference example.

| File | Required | Purpose |
|---|---|---|
| `problem.json` | yes | metadata, statement, samples, hints, editorial, starter code |
| `solution.py` | yes | reference solution — reads **stdin**, writes **stdout** (Python 3.12, standard library only) |
| `gen.py` | yes | test generator (see below) |
| `brute.py` | strongly recommended | slow but obviously-correct solution, used to cross-check `solution.py` |
| `tests.json` | generated | **never write by hand** — produced by `build_tests.py` |

## problem.json fields

```jsonc
{
  "slug": "same-as-directory-name",
  "title": "Human Title",
  "difficulty": "Easy | Medium | Hard",
  "tags": ["Dynamic Programming", "Arrays"],          // topic tags, Title Case
  "companies": ["Infosys"],
  "collections": ["infosys-sp-dse"],                   // see list below
  "source": "Honest provenance, e.g. 'Pattern reported by candidates in Infosys SP/DSE 2024 (PrepInsta, GfG experiences)'",
  "statement": "Markdown. Original wording. Story is fine, but be precise.",
  "inputFormat": "Markdown",
  "outputFormat": "Markdown",
  "constraints": "Markdown bullet list using `code` for math, e.g. - `1 ≤ N ≤ 10^5`",
  "samples": [ { "input": "…\n", "output": "…\n", "explanation": "markdown" } ],   // 1–3 samples
  "hints": ["progressive hint 1", "hint 2", "hint 3"],           // hidden behind 'reveal hint'
  "editorial": "Markdown: intuition, approach, complexity, common mistakes",  // hidden by default
  "youtube": [ { "title": "…", "url": "…", "kind": "video | search" } ],     // hidden by default
  "timeLimitMs": 2000,                                  // Python limit per test; 2000–4000
  "starter": { "python": "full program: reads input, calls an EMPTY function the user fills in" }
}
```

Collections: `infosys-sp-dse`, `infosys-easy-medium`, `hackwithinfy`, `infytq`, `fundamentals`, `hashing-drill`.

### Starter code rules
- Must be a complete, runnable program: input parsing and output printing are **done for the user**.
- The core function body contains **no logic** — just `# Write your code here` and a placeholder return
  (`return 0`, `return -1`, `return []`, `return ""` …).
- Give the function a descriptive name and clear parameters.

### YouTube links
- `kind: "video"` only for a real video URL you actually found **and verified** via
  `https://www.youtube.com/oembed?url=<video-url>&format=json` (returns the title when the video exists).
- Otherwise use `kind: "search"` with `https://www.youtube.com/results?search_query=<terms>` and a title starting `Search YouTube:`.
- Prefer 1 problem-specific video (if verifiable) + 1 concept video + 1 search link.

## gen.py

```python
EDGE_CASES = ["1\n5\n", ...]       # hand-written edge inputs (min sizes, all equal, negatives, max values…)
NUM_RANDOM = 14                     # number of random tests
def random_case(rng, i) -> str:     # rng = random.Random; scale size with i; last few should hit max constraints
def small_case(rng) -> str:         # tiny inputs for brute-force cross-checking (needs brute.py)
```

Keep `tests.json` under ~3 MB: only 2–3 tests at maximum size.
Reference solution must run each test in well under 1 s.

## Build & verify

```bash
python3 content/tools/build_tests.py content/problems/<slug>
```

It checks samples against `solution.py`, cross-checks `solution.py` vs `brute.py` on 300 small inputs,
checks the starter has no syntax errors, and writes `tests.json`. A problem is done only when it prints `[ OK ]`.

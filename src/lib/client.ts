/**
 * fetch() for client components that never throws.
 * Network failures and non-JSON error pages become a JSON body `{ error }`, so callers can always do
 * `const r = await safeFetch(...); const d = await r.json(); if (!r.ok) show(d.error)`.
 */
export async function safeFetch(input: string, init?: RequestInit): Promise<Response> {
  const asJson = (body: unknown, status: number) =>
    new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
  try {
    const r = await fetch(input, init);
    const text = await r.text();
    try {
      JSON.parse(text);
      return new Response(text, { status: r.status, headers: { "Content-Type": "application/json" } });
    } catch {
      const msg =
        r.status === 401
          ? "Your session expired — please sign in again."
          : r.status === 413
            ? "That's too large to send."
            : r.status >= 500
              ? `Server error (${r.status}). Please try again in a moment.`
              : `Unexpected response (${r.status}).`;
      return asJson({ error: msg }, r.ok ? 502 : r.status);
    }
  } catch {
    return asJson({ error: "Can't reach the server — check your connection and try again." }, 503);
  }
}

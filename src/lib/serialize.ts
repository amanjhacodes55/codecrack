/** Convert Mongo lean docs (ObjectIds, Dates) into plain JSON for client components. */
export function plain<T>(v: T): T {
  return JSON.parse(JSON.stringify(v));
}

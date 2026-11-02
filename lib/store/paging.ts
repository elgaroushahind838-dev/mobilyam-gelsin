export const ADMIN_PAGE_SIZE = 30;

export function clampPage(limitRaw: string | null, offsetRaw: string | null) {
  const limit = Math.min(50, Math.max(1, Number(limitRaw) || ADMIN_PAGE_SIZE));
  const offset = Math.min(10000, Math.max(0, Number(offsetRaw) || 0));
  return { limit, offset };
}

export function searchText(value: string | null) {
  return (value ?? "").replace(/[%_\\]/g, "").trim().slice(0, 80);
}

export function matchesQuery(haystack: string, q: string) {
  if (!q) return true;
  return haystack.toLocaleLowerCase("tr").includes(q.toLocaleLowerCase("tr"));
}

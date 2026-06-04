import type { ColumnDef } from "@tanstack/react-table"

export function getUniqueValues<T>(
  items: T[],
  extract: (item: T) => string | null | undefined,
): string[] {
  const set = new Set<string>()
  for (const item of items) {
    const v = extract(item)
    if (v) set.add(v)
  }
  return Array.from(set).sort()
}

export function columnLabel<T>(col: ColumnDef<T>): string {
  if (typeof col.header === "string") return col.header
  if (col.id)
    return col.id.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
  return ""
}

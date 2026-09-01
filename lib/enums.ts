
export function valuesOf<T extends Record<string, string>>(source: T): T[keyof T][] {
  return Object.values(source) as T[keyof T][];
}

export function isMemberOf<T extends Record<string, string>>(source: T, value: unknown): value is T[keyof T] {
  return typeof value === "string" && valuesOf(source).includes(value as T[keyof T]);
}

export const toStringOrNull = (value: any): string | null => {
  return value === null || value === undefined ? null : String(value)
}

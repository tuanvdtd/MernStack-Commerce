type DirtyFieldRecord = Record<string, unknown>

/** Check whether a field or array item changed since the latest reset. */
export function isFieldDirty(dirty: DirtyFieldRecord, name: string): boolean {
  const value = dirty[name]
  if (value === true) return true
  if (value === false || value === undefined) return false
  if (Array.isArray(value)) return value.some(Boolean)
  if (typeof value === "object" && value !== null) {
    return Object.keys(value).length > 0
  }
  return Boolean(value)
}

/**
 * Extract form values only for dirty fields; useful for partial PATCH payloads.
 * Supports nested objects and arrays (useFieldArray).
 */
export function getDirtyValues<T extends object>(
  dirtyFields: DirtyFieldRecord,
  values: T
): Partial<T> {
  const result: Partial<T> = {}

  for (const key of Object.keys(dirtyFields)) {
    const dirty = dirtyFields[key]
    const value = (values as Record<string, unknown>)[key]

    if (dirty === true) {
      ;(result as Record<string, unknown>)[key] = value
      continue
    }

    if (Array.isArray(dirty) && Array.isArray(value)) {
      const nested = dirty
        .map((item, index) =>
          item
            ? getDirtyValues(item as DirtyFieldRecord, value[index] as object)
            : undefined
        )
        .filter((item) => item !== undefined)

      if (nested.length > 0) {
        ;(result as Record<string, unknown>)[key] = nested
      }
      continue
    }

    if (typeof dirty === "object" && dirty !== null && typeof value === "object" && value) {
      const nested = getDirtyValues(dirty as DirtyFieldRecord, value as object)
      if (Object.keys(nested).length > 0) {
        ;(result as Record<string, unknown>)[key] = nested
      }
    }
  }

  return result
}

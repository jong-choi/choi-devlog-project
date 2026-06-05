export const serializeVector = (vector: number[]): string =>
  JSON.stringify(vector);

export const parseStoredVector = (
  value: string | number[] | null,
): number[] | null => {
  if (value === null) return null;

  if (Array.isArray(value)) {
    return value.every((item) => typeof item === "number") ? value : null;
  }

  const trimmed = value.trim();
  if (trimmed.length === 0) return null;

  try {
    const parsed: unknown = JSON.parse(trimmed);
    if (
      Array.isArray(parsed) &&
      parsed.every((item) => typeof item === "number")
    ) {
      return parsed;
    }
  } catch (_error) {
    return null;
  }

  return null;
};

export const safeSessionSet = <T>(key: string, value: T) => {
  if (typeof window !== "undefined") {
    sessionStorage.setItem(key, JSON.stringify(value));
  }
};

export function hydrateFromSessionStorage<T>(
  key: string,
  setter: (value: T) => void
) {
  if (typeof window === "undefined") return;

  const stored = sessionStorage.getItem(key);
  if (stored !== null) {
    try {
      const parsed = JSON.parse(stored);
      setter(parsed);
    } catch (e) {
      console.warn(`Failed to parse sessionStorage[${key}]`, e);
    }
  }
}

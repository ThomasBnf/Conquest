export const cleanPrefix = <T extends Record<string, unknown>>(
  prefix: string,
  data: unknown[],
): T[] =>
  data.map((item) => {
    const cleaned: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(
      item as Record<string, unknown>,
    )) {
      if (key.startsWith(prefix)) {
        cleaned[key.replace(prefix, "")] = value;
      } else {
        cleaned[key] = value;
      }
    }

    return cleaned as T;
  });

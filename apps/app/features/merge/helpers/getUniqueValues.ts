type GetUniqueValuesProps<T, K extends keyof T> = {
  items: T[];
  field: K;
  idField?: keyof T;
};

export const getUniqueValues = <T, K extends keyof T>({
  items,
  field,
  idField = "id" as keyof T,
}: GetUniqueValuesProps<T, K>): Array<{
  [key in typeof idField | typeof field]: T[key];
}> => {
  return items.reduce<
    Array<{ [key in typeof idField | typeof field]: T[key] }>
  >((acc, item) => {
    const fieldValue = item[field];

    if (!acc.some((existingItem) => existingItem[field] === fieldValue)) {
      const newItem = {
        [idField]: item[idField],
        [field]: fieldValue,
      } as { [key in typeof idField | typeof field]: T[key] };

      acc.push(newItem);
    }

    return acc;
  }, []);
};

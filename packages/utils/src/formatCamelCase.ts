export const formatCamelCase = (string: string) => {
  return string
    .replaceAll("_", " ")
    .replace(/([A-Z])/g, " $1")
    .trim();
};

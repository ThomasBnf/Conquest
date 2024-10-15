export const getAttachements = (text: string | undefined) => {
  const links = text?.match(/<(.*?)>/g);

  return (
    links?.map((link) => {
      const cleanedLink = link.slice(1, -1);
      const parts = cleanedLink.split("|");

      if (parts.length > 1) {
        const url = parts[0] ?? "";
        const title = parts[1] ?? "";
        return { url, title };
      }
      return { url: parts[0] ?? "", title: parts[0] ?? "" };
    }) ?? []
  );
};

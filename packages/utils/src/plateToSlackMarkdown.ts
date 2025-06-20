import { Message } from "@conquest/zod/schemas/node.schema";

export const plateToSlackMarkdown = (message: Message): string => {
  const applyInnerStyles = (
    text: string,
    italic?: boolean,
    strikethrough?: boolean,
  ): string => {
    if (!text) return "";

    let result = text;

    if (strikethrough) result = `~${result}~`;
    if (italic) result = `_${result}_`;

    return result;
  };

  const serializeChildren = (children: Message[0]["children"]): string => {
    if (!children || children.length === 0) return "";

    const segments: Array<{
      parts: Array<{
        text: string;
        italic?: boolean;
        strikethrough?: boolean;
      }>;
      bold: boolean;
    }> = [];

    for (const child of children) {
      if ("type" in child && child.type === "mention") {
        const lastSegment = segments[segments.length - 1];

        if (lastSegment?.bold) {
          lastSegment.parts.push({ text: child.value });
        } else {
          segments.push({
            parts: [{ text: child.value }],
            bold: true,
          });
        }
        continue;
      }

      if ("text" in child) {
        const { text, bold, italic, strikethrough } = child;

        if (!text) continue;

        const lastSegment = segments[segments.length - 1];

        if (lastSegment && lastSegment.bold === !!bold) {
          lastSegment.parts.push({ text, italic, strikethrough });
        } else {
          segments.push({
            parts: [{ text, italic, strikethrough }],
            bold: !!bold,
          });
        }
      }
    }

    return segments
      .map((segment) => {
        const content = segment.parts
          .map((part) =>
            applyInnerStyles(part.text, part.italic, part.strikethrough),
          )
          .join("");

        return segment.bold ? `*${content}*` : content;
      })
      .join("");
  };

  return message
    .map((node) => {
      const line = serializeChildren(node.children);
      return line || null;
    })
    .filter(Boolean)
    .join("\n\n")
    .trim();
};

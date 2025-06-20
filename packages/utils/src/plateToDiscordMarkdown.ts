import { Message } from "@conquest/zod/schemas/node.schema";

export const plateToDiscordMarkdown = (message: Message): string => {
  const applyInnerStyles = (
    text: string,
    italic?: boolean,
    strikethrough?: boolean,
    underline?: boolean,
  ): string => {
    if (!text) return "";

    let result = text;

    if (strikethrough) result = `~~${result}~~`;
    if (underline) result = `__${result}__`;
    if (italic) result = `*${result}*`;

    return result;
  };

  const serializeChildren = (children: Message[0]["children"]): string => {
    if (!children || children.length === 0) return "";

    const segments: Array<{
      parts: Array<{
        text: string;
        italic?: boolean;
        strikethrough?: boolean;
        underline?: boolean;
      }>;
      bold: boolean;
    }> = [];

    for (const child of children) {
      if ("type" in child && child.type === "mention") {
        const lastSegment = segments[segments.length - 1];

        if (lastSegment && !lastSegment.bold) {
          lastSegment.parts.push({ text: child.value });
        } else {
          segments.push({
            parts: [{ text: child.value }],
            bold: false,
          });
        }
        continue;
      }

      if ("text" in child) {
        const { text, bold, italic, strikethrough, underline } = child;

        if (!text) continue;

        const lastSegment = segments[segments.length - 1];

        if (lastSegment && lastSegment.bold === !!bold) {
          lastSegment.parts.push({ text, italic, strikethrough, underline });
        } else {
          segments.push({
            parts: [{ text, italic, strikethrough, underline }],
            bold: !!bold,
          });
        }
      }
    }

    return segments
      .map((segment) => {
        const content = segment.parts
          .map((part) =>
            applyInnerStyles(
              part.text,
              part.italic,
              part.strikethrough,
              part.underline,
            ),
          )
          .join("");

        return segment.bold ? `**${content}**` : content;
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

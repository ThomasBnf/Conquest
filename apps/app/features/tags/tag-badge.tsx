import { Badge } from "@conquest/ui/badge";
import type { Tag } from "@conquest/zod/schemas/tag.schema";

type Props = {
  tag: Tag | undefined;
  transparent?: boolean;
};

export const TagBadge = ({ tag, transparent = false }: Props) => {
  if (!tag) return null;

  const colorMap = {
    "1": "#E7C200",
    "2": "#CD7F31",
    "3": "#C0C0C0",
  };

  const tagColor =
    tag.source === "DISCOURSE"
      ? colorMap[tag.color as keyof typeof colorMap]
      : tag.color;

  return (
    <Badge variant={transparent ? "transparent" : "outline"}>
      <div
        className="size-2.5 rounded-full"
        style={{ backgroundColor: tagColor }}
      />
      <p className="leading-none">{tag.name}</p>
    </Badge>
  );
};

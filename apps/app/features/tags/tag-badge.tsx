import { Badge } from "@conquest/ui/badge";
import type { Tag } from "@conquest/zod/schemas/tag.schema";

type Props = {
  tag: Tag | undefined;
  transparent?: boolean;
};

export const TagBadge = ({ tag, transparent = false }: Props) => {
  if (!tag) return null;

  return (
    <Badge variant={transparent ? "transparent" : "outline"}>
      <div
        className="size-2.5 rounded-full"
        style={{ backgroundColor: tag.color }}
      />
      <p className="leading-none">{tag.name}</p>
    </Badge>
  );
};

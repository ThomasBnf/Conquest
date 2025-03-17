import { Badge } from "@conquest/ui/badge";
import type { Tag } from "@conquest/zod/schemas/tag.schema";
import { X } from "lucide-react";

type Props = {
  tag: Tag | undefined;
  transparent?: boolean;
  onDelete?: () => void;
  deletable?: boolean;
};

export const TagBadge = ({
  tag,
  transparent = false,
  onDelete,
  deletable,
}: Props) => {
  if (!tag) return null;

  return (
    <Badge variant={transparent ? "transparent" : "secondary"}>
      <div
        className="size-2.5 rounded-full"
        style={{ backgroundColor: tag.color }}
      />
      <p className="leading-none">{tag.name}</p>
      {deletable && (
        <div onClick={onDelete}>
          <X
            size={13}
            className="shrink-0 text-muted-foreground hover:text-foreground"
          />
        </div>
      )}
    </Badge>
  );
};

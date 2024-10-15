import { Button } from "@conquest/ui/button";
import { cn } from "@conquest/ui/utils/cn";
import type { Tag } from "@conquest/zod/tag.schema";
import { X } from "lucide-react";

type Props = {
  tag: Tag | undefined;
  isClickable?: boolean;
  onDelete?: (event: React.MouseEvent<HTMLButtonElement>) => void;
};

export const TagBadge = ({ tag, isClickable = false, onDelete }: Props) => {
  if (!tag) return;

  return (
    <div
      className={cn(
        "flex h-6 w-fit items-center gap-2 rounded-md border px-1.5",
        isClickable && "cursor-pointer transition-colors hover:bg-muted",
        !!onDelete && "cursor-pointer",
      )}
    >
      <div
        className="size-2.5 rounded-full"
        style={{ backgroundColor: tag.color }}
      />
      <p className="leading-none">{tag.name}</p>
      {!!onDelete && (
        <Button
          variant="ghost"
          size="xs"
          className="size-4 text-muted-foreground"
          onClick={onDelete}
        >
          <X size={14} />
        </Button>
      )}
    </div>
  );
};

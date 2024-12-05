import { cn } from "@conquest/ui/cn";
import type { Tag } from "@conquest/zod/tag.schema";

type Props = {
  tag: Tag | undefined;
};

export const TagBadge = ({ tag }: Props) => {
  if (!tag) return;

  return (
    <div
      className={cn(
        "flex h-6 w-fit items-center gap-2 rounded-md border px-1.5",
      )}
    >
      <div
        className="size-2.5 rounded-full"
        style={{ backgroundColor: tag.color }}
      />
      <p className="leading-none">{tag.name}</p>
    </div>
  );
};

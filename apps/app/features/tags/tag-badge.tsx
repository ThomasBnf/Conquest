import { cn } from "@conquest/ui/cn";
import type { Tag } from "@conquest/zod/tag.schema";

type Props = {
  tag: Tag | undefined;
};

export const TagBadge = ({ tag }: Props) => {
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
    <div
      className={cn(
        "flex h-6 w-fit items-center gap-2 rounded-md border px-1.5",
      )}
    >
      <div
        className="size-2.5 rounded-full"
        style={{ backgroundColor: tagColor }}
      />
      <p className="leading-none">{tag.name}</p>
    </div>
  );
};

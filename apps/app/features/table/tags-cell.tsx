import { Button } from "@conquest/ui/src/components/button";
import type { Tag } from "@conquest/zod/schemas/tag.schema";
import { useState } from "react";
import { TagBadge } from "../tags/tag-badge";

type Props = {
  memberTags: Tag[] | undefined;
};

export const TagsCell = ({ memberTags }: Props) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!memberTags?.length) return null;

  const visibleTags = isExpanded ? memberTags : memberTags.slice(0, 1);
  const remainingCount = memberTags.length - 1;
  const shouldShowButton = memberTags.length > 1;

  return (
    <div className="flex flex-wrap items-center gap-1 p-2">
      {visibleTags.map((tag) => (
        <TagBadge key={tag.id} tag={tag} />
      ))}
      {shouldShowButton && (
        <Button
          variant="ghost"
          size="xs"
          className="text-gray-500 hover:text-gray-700"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? "Show less" : `+${remainingCount}`}
        </Button>
      )}
    </div>
  );
};

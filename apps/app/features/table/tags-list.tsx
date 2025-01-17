import { TagBadge } from "@/features/tags/tag-badge";
import type { Tag } from "@conquest/zod/schemas/tag.schema";

type Props = {
  tags: Tag[] | undefined;
};

export const TagsList = ({ tags }: Props) => {
  return (
    <div className="flex flex-wrap gap-1 px-2">
      {tags?.map((tag) => (
        <TagBadge key={tag.id} tag={tag} />
      ))}
    </div>
  );
};

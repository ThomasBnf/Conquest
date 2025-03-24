import type { Tag } from "@conquest/zod/schemas/tag.schema";
import { useState } from "react";
import { TagForm } from "./tag-form";
import { TagMenu } from "./tag-menu";

type Props = {
  tag: Tag;
};

export const TagCard = ({ tag }: Props) => {
  const [isEditing, setIsEditing] = useState(false);

  if (isEditing) return <TagForm tag={tag} setIsEditing={setIsEditing} />;

  return (
    <div className="flex h-12 items-center justify-between rounded-md border py-2 pr-2 pl-4">
      <div className="flex items-center gap-2">
        <div
          className="size-3 rounded-full"
          style={{ backgroundColor: tag.color }}
        />
        <p className="truncate font-medium">{tag.name}</p>
      </div>
      <TagMenu tag={tag} setIsEditing={setIsEditing} />
    </div>
  );
};

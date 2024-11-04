import type { Tag } from "@conquest/zod/tag.schema";
import { useState } from "react";
import { TagForm } from "./tag-form";
import { TagMenu } from "./tag-menu";

type Props = {
  tag: Tag;
};

export const TagCard = ({ tag }: Props) => {
  const [isEditing, setIsEditing] = useState(false);

  if (isEditing)
    return (
      <TagForm tag={tag} isEditing={isEditing} setIsEditing={setIsEditing} />
    );

  return (
    <div className="flex items-center justify-between rounded-lg border px-4 py-2">
      <div className="flex items-center gap-2">
        <div
          className="size-3 rounded-full"
          style={{ backgroundColor: tag.color }}
        />
        <p className="font-medium truncate">{tag.name}</p>
      </div>
      <TagMenu tag={tag} setIsEditing={setIsEditing} />
    </div>
  );
};

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
    <div className="flex items-center justify-between rounded-md border px-4 py-2">
      <div className="flex items-center gap-2">
        <div
          className="size-3 rounded-full"
          style={{ backgroundColor: tagColor }}
        />
        <p className="truncate font-medium">{tag.name}</p>
      </div>
      <TagMenu tag={tag} setIsEditing={setIsEditing} />
    </div>
  );
};

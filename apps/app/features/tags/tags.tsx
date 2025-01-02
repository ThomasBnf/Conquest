"use client";

import { Button } from "@conquest/ui/button";
import type { Tag } from "@conquest/zod/schemas/tag.schema";
import { QueryInput } from "components/custom/query-input";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useDebounce } from "use-debounce";
import { TagCard } from "./tag-card";
import { TagForm } from "./tag-form";

type Props = {
  tags: Tag[] | undefined;
};

export const Tags = ({ tags }: Props) => {
  const [isVisible, setIsVisible] = useState(false);
  const [query, setQuery] = useDebounce("", 500);

  const filteredTags = tags?.filter((tag) =>
    tag.name.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <QueryInput query={query} setQuery={setQuery} />
        <Button disabled={isVisible} onClick={() => setIsVisible(true)}>
          <Plus size={16} />
          New tag
        </Button>
      </div>
      <TagForm isVisible={isVisible} setIsVisible={setIsVisible} />
      <div className="flex flex-col gap-1">
        {filteredTags?.map((tag) => (
          <TagCard key={tag.id} tag={tag} />
        ))}
      </div>
    </div>
  );
};

"use client";

import { Button } from "@conquest/ui/button";
import type { Tag } from "@conquest/zod/tag.schema";
import { QueryInput } from "components/custom/query-input";
import { useState } from "react";
import { useDebounce } from "use-debounce";
import { TagCard } from "./TagCard";
import { TagForm } from "./TagForm";

type Props = {
  tags: Tag[] | undefined;
};

export const ListTags = ({ tags }: Props) => {
  const [isVisible, setIsVisible] = useState(false);
  const [query, setQuery] = useDebounce("", 500);

  return (
    <div className="mt-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <QueryInput query={query} setQuery={setQuery} />
        <Button disabled={isVisible} onClick={() => setIsVisible(true)}>
          New tag
        </Button>
      </div>
      <TagForm isVisible={isVisible} setIsVisible={setIsVisible} />
      <div className="flex flex-col gap-1">
        {tags
          ?.filter((tag) =>
            tag.name.toLowerCase().includes(query.toLowerCase()),
          )
          .map((tag) => (
            <TagCard key={tag.id} tag={tag} />
          ))}
      </div>
    </div>
  );
};

"use client";

import { QueryInput } from "@/components/custom/query-input";
import type { Tag } from "@/schemas/tag.schema";
import { Button } from "@conquest/ui/button";
import { useState } from "react";
import { useDebounceValue } from "usehooks-ts";
import { TagCard } from "./TagCard";
import { TagForm } from "./TagForm";

type Props = {
  tags: Tag[] | undefined;
};

export const ListTags = ({ tags }: Props) => {
  const [isVisible, setIsVisible] = useState(false);
  const [query, setQuery] = useDebounceValue("", 500);

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

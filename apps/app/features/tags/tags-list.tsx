"use client";

import { IsLoading } from "@/components/states/is-loading";
import { trpc } from "@/server/client";
import { Button } from "@conquest/ui/button";
import { QueryInput } from "components/custom/query-input";
import { Plus } from "lucide-react";
import { useState } from "react";
import { TagCard } from "./tag-card";
import { TagForm } from "./tag-form";

type Tag = {
  id: string;
  name: string;
};

export const TagsList = () => {
  const { data: tags, isLoading } = trpc.tags.list.useQuery();
  const [isVisible, setIsVisible] = useState(false);
  const [query, setQuery] = useState("");

  const filteredTags =
    tags?.filter((tag) =>
      tag.name.toLowerCase().includes(query.toLowerCase()),
    ) ?? [];

  if (isLoading) return <IsLoading />;

  return (
    <div className="flex flex-col gap-4">
      {tags && tags.length > 0 && (
        <div className="flex items-center justify-between">
          <QueryInput query={query} setQuery={setQuery} />
          <Button disabled={isVisible} onClick={() => setIsVisible(true)}>
            <Plus size={16} />
            New tag
          </Button>
        </div>
      )}
      {isVisible && <TagForm setIsVisible={setIsVisible} />}

      <div className="relative">
        {filteredTags.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 rounded-md border bg-muted px-6 py-12">
            <div className="flex flex-col items-center">
              <p className="font-medium text-base">No tags found</p>
              <p className="text-muted-foreground">
                Create your first tag to categorize your members
              </p>
            </div>
            <Button disabled={isVisible} onClick={() => setIsVisible(true)}>
              <Plus size={16} />
              New tag
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            {filteredTags.map((tag) => (
              <TagCard key={tag.id} tag={tag} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

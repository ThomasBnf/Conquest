"use client";

import { useFilters } from "@/context/filtersContext";
import { useListTags } from "@/features/tags/hooks/useListTags";
import { TagBadge } from "@/features/tags/tag-badge";
import { Button } from "@conquest/ui/button";
import {
  Popover,
  PopoverCheckboxItem,
  PopoverContent,
  PopoverTrigger,
} from "@conquest/ui/popover";
import { Skeleton } from "@conquest/ui/skeleton";
import type { FilterTag } from "@conquest/zod/filters.schema";
import type { Tag } from "@conquest/zod/tag.schema";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

type Props = {
  filter: FilterTag;
};

export const TagPicker = ({ filter }: Props) => {
  const { onUpdateFilter } = useFilters();
  const { tags, isLoading } = useListTags();
  const [values, setValues] = useState(filter.values);

  const handleTagToggle = async (tag: Tag) => {
    setValues((prev) => {
      const updatedValues = prev.includes(tag.id)
        ? prev.filter((t) => t !== tag.id)
        : [...prev, tag.id];

      onUpdateFilter({
        ...filter,
        values: updatedValues,
      });

      return updatedValues;
    });
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="dropdown"
          className="w-full rounded-none"
          classNameSpan="justify-between"
        >
          {values.length > 0 ? (
            <span className="capitalize">
              {values.length > 1 ? (
                `${values.length} tags`
              ) : (
                <TagBadge
                  tag={tags?.find((t) => t.id === values[0])}
                  isClickable
                />
              )}
            </span>
          ) : (
            <span className="text-muted-foreground">Select tags</span>
          )}
          <ChevronDown size={14} />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-44">
        {isLoading ? (
          <Skeleton className="h-5 w-full" />
        ) : (
          tags?.map((tag) => (
            <PopoverCheckboxItem
              key={tag.id}
              checked={values?.includes(tag.id)}
              onCheckedChange={() => handleTagToggle(tag)}
            >
              <div
                className="size-3 rounded-full"
                style={{ backgroundColor: tag.color }}
              />
              {tag.name}
            </PopoverCheckboxItem>
          ))
        )}
      </PopoverContent>
    </Popover>
  );
};

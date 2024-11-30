import { FilterButton } from "@/features/filters/filter-button";
import { useSelected } from "@/features/workflows/hooks/useSelected";
import { Label } from "@conquest/ui/label";
import type { Filter } from "@conquest/zod/filters.schema";
import { NodeListMembersSchema } from "@conquest/zod/node.schema";
import { useReactFlow } from "@xyflow/react";
import { useState } from "react";

export const FilterOptions = () => {
  const { selected } = useSelected();
  const { updateNode } = useReactFlow();

  const parsedNode = NodeListMembersSchema.parse(selected?.data);
  const [filters, setFilters] = useState<Filter[]>(parsedNode.filters);

  const handleUpdateNode = (filters: Filter[]) => {
    if (!selected) return;

    updateNode(selected.id, {
      ...selected,
      data: {
        ...selected.data,
        filters,
      },
    });
  };

  return (
    <div className="flex flex-col gap-1.5">
      <Label>Filters</Label>
      <FilterButton
        filters={filters}
        setFilters={setFilters}
        handleUpdateNode={handleUpdateNode}
      />
    </div>
  );
};

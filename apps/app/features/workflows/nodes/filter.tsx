import { FiltersProvider } from "@/context/filtersContext";
import { FiltersList } from "@/features/filters/filters-list";
import { Label } from "@conquest/ui/label";
import { GroupFilters } from "@conquest/zod/schemas/filters.schema";
import { NodeFilterSchema } from "@conquest/zod/schemas/node.schema";
import { useReactFlow } from "@xyflow/react";
import { usePanel } from "../hooks/usePanel";

export const Filter = () => {
  const { node } = usePanel();
  const { updateNodeData } = useReactFlow();

  const { groupFilter } = NodeFilterSchema.parse(node?.data);

  const saveFilters = async (newGroupFilters: GroupFilters) => {
    if (!node) return;

    updateNodeData(node.id, {
      ...node.data,
      groupFilter: newGroupFilters,
    });
  };

  return (
    <div className="flex flex-col gap-2">
      <Label>Filter</Label>
      <FiltersProvider
        initialGroupFilters={groupFilter}
        saveFilters={saveFilters}
      >
        <FiltersList />
      </FiltersProvider>
    </div>
  );
};

import { FiltersProvider } from "@/context/filtersContext";
import { FiltersList } from "@/features/filters/filters-list";
import { Label } from "@conquest/ui/label";
import { GroupFilters } from "@conquest/zod/schemas/filters.schema";
import { NodeIfElseSchema } from "@conquest/zod/schemas/node.schema";
import { useReactFlow } from "@xyflow/react";
import { useWorkflow } from "../context/workflowContext";

export const IfElse = () => {
  const { node } = useWorkflow();
  const { updateNodeData } = useReactFlow();
  const { groupFilters } = NodeIfElseSchema.parse(node?.data);

  const saveFilters = async (newGroupFilters: GroupFilters) => {
    if (!node) return;

    updateNodeData(node.id, {
      ...node.data,
      groupFilters: newGroupFilters,
    });
  };

  return (
    <div className="space-y-1">
      <Label>Filter</Label>
      <FiltersProvider
        initialGroupFilters={groupFilters}
        saveFilters={saveFilters}
      >
        <FiltersList className="h-9 w-full" />
      </FiltersProvider>
    </div>
  );
};

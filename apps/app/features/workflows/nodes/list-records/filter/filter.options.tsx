import { useWorkflow } from "@/context/workflowContext";
import { Label } from "@conquest/ui/label";
import { NodeListRecordsSchema } from "@conquest/zod/node.schema";
import { FiltersProvider } from "context/filtersContext";
import { GroupFilters } from "./group-filters";

export const FilterOptions = () => {
  const { currentNode } = useWorkflow();
  const parsedNode = NodeListRecordsSchema.parse(currentNode?.data);

  return (
    <FiltersProvider node={parsedNode}>
      <div className="flex flex-col gap-1.5">
        <Label>Condition</Label>
        <GroupFilters />
      </div>
    </FiltersProvider>
  );
};

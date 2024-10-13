import { Label } from "@conquest/ui/label";
import { FiltersProvider } from "context/filtersContext";
import { useWorkflow } from "context/workflowContext";
import { NodeListRecordsSchema } from "schemas/node.schema";
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

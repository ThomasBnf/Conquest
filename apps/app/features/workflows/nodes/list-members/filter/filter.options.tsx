import { useSelected } from "@/features/workflows/hooks/useSelected";
import { Label } from "@conquest/ui/label";
import { NodeListMembersSchema } from "@conquest/zod/node.schema";
import { FiltersProvider } from "context/filtersContext";
import { GroupFilters } from "./group-filters";

export const FilterOptions = () => {
  const { selected } = useSelected();
  const parsedNode = NodeListMembersSchema.parse(selected?.data);

  return (
    <FiltersProvider node={parsedNode}>
      <div className="flex flex-col gap-1.5">
        <Label>Condition</Label>
        <GroupFilters />
      </div>
    </FiltersProvider>
  );
};

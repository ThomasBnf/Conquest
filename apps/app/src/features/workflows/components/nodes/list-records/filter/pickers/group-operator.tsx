import { useFilters } from "@/context/filtersContext";
import type { GroupFilter } from "@/schemas/node.schema";
import { Button } from "@conquest/ui/button";
import { RefreshCcw } from "lucide-react";

type Props = {
  groupFilter: GroupFilter;
  isFirstFilter: boolean;
};

export const GroupOperatorPicker = ({ groupFilter, isFirstFilter }: Props) => {
  const { onUpdateGroupFilter } = useFilters();

  const onUpdateGroupOperator = (operator: "and" | "or") => {
    onUpdateGroupFilter({
      ...groupFilter,
      operator,
    });
  };

  if (isFirstFilter)
    return (
      <p className="flex h-8 w-16 shrink-0 items-center justify-center px-2 text-muted-foreground">
        Where
      </p>
    );

  return (
    <Button
      variant="dropdown"
      className="w-16 shrink-0 rounded-none capitalize"
      onClick={() =>
        onUpdateGroupOperator(groupFilter.operator === "and" ? "or" : "and")
      }
    >
      {groupFilter.operator}
      <RefreshCcw size={14} />
    </Button>
  );
};

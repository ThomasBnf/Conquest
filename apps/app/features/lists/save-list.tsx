import { useFilters } from "@/context/filtersContext";
import { useOpenList } from "@/hooks/useOpenList";
import { Button } from "@conquest/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@conquest/ui/tooltip";
import { usePathname } from "next/navigation";

export const SaveList = () => {
  const { groupFilters, resetFilters } = useFilters();
  const { setOpen } = useOpenList();
  const pathname = usePathname();
  const isListPage = pathname.includes("lists");

  if (isListPage) return null;
  if (groupFilters.filters.length === 0) return null;

  return (
    <div className="flex h-full items-center gap-1 border-r pr-2">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline" onClick={resetFilters}>
            Clear
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>Clear all filters</p>
        </TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button onClick={() => setOpen(true)}>Save</Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>Save as a list</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
};

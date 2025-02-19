import { Members } from "@/components/icons/Members";
import { useFilters } from "@/context/filtersContext";
import { tableParsers } from "@/lib/searchParamsTable";
import { Button } from "@conquest/ui/button";
import { useRouter } from "next/navigation";
import { useQueryStates } from "nuqs";

export const EmptyTable = () => {
  const { resetFilters, groupFilters } = useFilters();
  const [_, setParams] = useQueryStates(tableParsers);
  const router = useRouter();

  if (groupFilters.filters.length > 0) {
    <div className="flex h-full flex-col items-center justify-center text-center">
      <Members />
      <div className="mt-2 mb-4">
        <p className="font-medium text-base">No members found</p>
        <p className="text-muted-foreground text-sm">
          Please check your filters or try a different search.
        </p>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          resetFilters();
          setParams({});
        }}
      >
        Clear filters
      </Button>
    </div>;
  }

  return (
    <div className="flex h-full flex-col items-center justify-center text-center">
      <Members />
      <div className="mt-2 mb-4">
        <p className="font-medium text-base">No members found</p>
        <p className="text-muted-foreground text-sm">
          You don't have any members yet in workspace.
        </p>
      </div>
      <Button size="sm" onClick={() => router.push("/settings/integrations")}>
        Add integration
      </Button>
    </div>
  );
};

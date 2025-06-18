import { useFilters } from "@/context/filtersContext";
import { tableMembersParams } from "@/utils/tableParams";
import { Button } from "@conquest/ui/button";
import { Members } from "@conquest/ui/icons/Members";
import { useRouter } from "next/navigation";
import { useQueryStates } from "nuqs";

export const EmptyTable = () => {
  const { resetFilters } = useFilters();
  const router = useRouter();

  const [{ search }, setParams] = useQueryStates(tableMembersParams);

  if (search) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-center">
        <Members />
        <div className="mt-2 mb-4">
          <p className="font-medium text-base">No companies found</p>
          <p className="text-muted-foreground">
            Please try a different search.
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => {
            resetFilters();
            setParams({});
          }}
        >
          Clear filters
        </Button>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col items-center justify-center text-center">
      <Members />
      <div className="mt-2 mb-4">
        <p className="font-medium text-base">No companies found</p>
        <p className="text-muted-foreground">
          You don't have any companies yet in workspace.
        </p>
      </div>
      <Button size="sm" onClick={() => router.push("/settings/integrations")}>
        Add integration
      </Button>
    </div>
  );
};

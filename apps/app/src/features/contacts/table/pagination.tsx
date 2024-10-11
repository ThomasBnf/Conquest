import type { ContactWithActivities } from "@/schemas/activity.schema";
import { Button } from "@conquest/ui/button";
import type { Table } from "@tanstack/react-table";
import { parseAsInteger, useQueryState } from "nuqs";

type Props = {
  table: Table<ContactWithActivities>;
};

export const Pagination = ({ table }: Props) => {
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(0));

  return (
    <div className="flex shrink-0 items-center justify-between p-4">
      <p className="text-muted-foreground">
        Page {page + 1} of {table.getPageCount()}
      </p>
      <div className="space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            table.previousPage();
            setPage(page - 1);
          }}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            table.nextPage();
            setPage(page + 1);
          }}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

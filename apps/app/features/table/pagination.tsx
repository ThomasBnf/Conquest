import { tableParsers } from "@/lib/searchParamsTable";
import { Button } from "@conquest/ui/button";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useQueryStates } from "nuqs";
import { PageSize } from "./page-size";

type Props = {
  count: number;
};

export const Pagination = ({ count }: Props) => {
  const [{ page, pageSize }, setParams] = useQueryStates(tableParsers);

  const currentCount = (page - 1) * pageSize + pageSize;
  const totalPages = Math.ceil(count / pageSize);
  const hasPreviousPage = page > 1;
  const hasNextPage = page < totalPages;

  return (
    <div className="flex h-14 shrink-0 items-center justify-between px-4">
      <div className="flex items-center gap-2">
        <p className="text-muted-foreground">
          <span>{1 + (page - 1) * pageSize}-</span>
          <span>{currentCount > count ? count : currentCount}</span>
          <span> of {count}</span>
          <span> • Results per page</span>
        </p>
        <PageSize />
      </div>
      {totalPages > 1 && (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            disabled={!hasPreviousPage}
            onClick={() => {
              if (hasPreviousPage) setParams({ page: page - 1 });
            }}
          >
            <ChevronLeftIcon size={16} />
          </Button>
          <p className="text-sm">
            {page}/{totalPages}
          </p>
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            disabled={!hasNextPage}
            onClick={() => {
              if (hasNextPage) setParams({ page: page + 1 });
            }}
          >
            <ChevronRightIcon size={16} />
          </Button>
        </div>
      )}
    </div>
  );
};

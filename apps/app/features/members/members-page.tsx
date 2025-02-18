"use client";

import { QueryInput } from "@/components/custom/query-input";
import { Members } from "@/components/icons/Members";
import { useFilters } from "@/context/filtersContext";
import { useMembers } from "@/context/membersContext";
import { tableParsers } from "@/lib/searchParamsTable";
import { Button } from "@conquest/ui/button";
import { useQueryStates } from "nuqs";
import { FiltersList } from "../filters/filters-list";
import { CreateListDialog } from "../lists/create-list-dialog";
import { ExportListMembers } from "../lists/export-list-members";
import { ColumnVisibility } from "../table/column-visibility";
import { DataTable } from "../table/data-table";
import { useTable } from "../table/hooks/useTable";
import { membersColumns } from "../table/members-columns";

export const MembersPage = () => {
  const { resetFilters } = useFilters();
  const [{ search, idMember, descMember }, setParams] =
    useQueryStates(tableParsers);
  const { data, count, isLoading } = useMembers();

  const { table } = useTable({
    data: data ?? [],
    columns: membersColumns,
    count: count ?? 0,
    left: ["full_name"],
    id: idMember,
    desc: descMember,
    type: "members",
  });

  return (
    <div className="flex h-full flex-col divide-y overflow-hidden">
      <div className="flex h-12 shrink-0 items-center gap-2 px-4">
        <QueryInput
          placeholder="Search..."
          query={search}
          setQuery={(value) => setParams({ search: value })}
        />
        <FiltersList />
        <div className="ml-auto flex items-center gap-2">
          <CreateListDialog />
          <ExportListMembers members={data} />
          <ColumnVisibility table={table} type="members" />
        </div>
      </div>
      {data?.length === 0 ? (
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
        </div>
      ) : (
        <DataTable table={table} isLoading={isLoading} count={count ?? 0} />
      )}
    </div>
  );
};

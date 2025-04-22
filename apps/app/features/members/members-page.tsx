"use client";

import { QueryInput } from "@/components/custom/query-input";
import { useFilters } from "@/context/filtersContext";
import { useTable } from "@/hooks/useTable";
import { trpc } from "@/server/client";
import { tableMembersParams } from "@/utils/tableParams";
import { Separator } from "@conquest/ui/separator";
import { useSession } from "next-auth/react";
import { useQueryStates } from "nuqs";
import { useMemo } from "react";
import { FiltersList } from "../filters/filters-list";
import { SaveList } from "../lists/save-list";
import { membersColumns } from "../table/columns/members-columns";
import { DataTable } from "../table/data-table";
import { EmptyTable } from "../table/empty-table-members";
import { ColumnSettings } from "../table/settings/columnSettings";
import { ExportListMembers } from "./export-list-members";

export const MembersPage = () => {
  const { groupFilters } = useFilters();
  const { data: session } = useSession();
  const { user } = session ?? {};

  const columns = useMemo(() => membersColumns(), []);
  const params = useQueryStates(tableMembersParams);
  const [{ search, id, desc }, setParams] = params;

  const { data, isLoading, fetchNextPage } = trpc.members.list.useInfiniteQuery(
    { search, id, desc, groupFilters },
    { getNextPageParam: (_, allPages) => allPages.length * 25 },
  );

  const { data: count } = trpc.members.count.useQuery({
    search,
    groupFilters,
  });

  const members = data?.pages.flat();
  const hasNextPage = data?.pages.at(-1)?.length === 25;

  const table = useTable({
    columns,
    data: members ?? [],
    fetchNextPage,
    hasNextPage,
    isLoading,
    count,
    preferences: user?.members_preferences,
  });

  return (
    <div className="relative flex h-full flex-col overflow-hidden">
      <div className="flex h-full flex-col">
        <div className="flex h-12 shrink-0 items-center gap-2 px-3">
          <QueryInput
            placeholder="Search..."
            query={search}
            setQuery={(value) => setParams({ search: value })}
          />
          <FiltersList />
          <div className="ml-auto flex items-center gap-2">
            <SaveList />
            <ExportListMembers members={members} />
            <ColumnSettings table={table} />
          </div>
        </div>
        <Separator />
        {members?.length === 0 ? <EmptyTable /> : <DataTable table={table} />}
      </div>
    </div>
  );
};

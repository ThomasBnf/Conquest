"use client";

import { QueryInput } from "@/components/custom/query-input";
import { useMembers } from "@/context/membersContext";
import { tableParsers } from "@/lib/searchParamsTable";
import { useQueryStates } from "nuqs";
import { FiltersList } from "../filters/filters-list";
import { ExportListMembers } from "../lists/export-list-members";
import { SaveList } from "../lists/save-list";
import { ColumnVisibility } from "../table/column-visibility";
import { DataTable } from "../table/data-table";
import { useTable } from "../table/hooks/useTable";
import { membersColumns } from "../table/members-columns";
import { EmptyTable } from "./empty-table";

export const MembersPage = () => {
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
          <SaveList />
          <ExportListMembers members={data} />
          <ColumnVisibility table={table} type="members" />
        </div>
      </div>
      {data?.length === 0 ? (
        <EmptyTable />
      ) : (
        <DataTable table={table} isLoading={isLoading} count={count ?? 0} />
      )}
    </div>
  );
};

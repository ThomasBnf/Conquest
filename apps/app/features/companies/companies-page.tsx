"use client";

import { QueryInput } from "@/components/custom/query-input";
import { useTable } from "@/hooks/useTable";
import { trpc } from "@/server/client";
import { tableCompaniesParams } from "@/utils/tableParams";
import { Separator } from "@conquest/ui/separator";
import { useSession } from "next-auth/react";
import { useQueryStates } from "nuqs";
import { companiesColumns } from "../table/columns/companies-columns";
import { DataTable } from "../table/data-table";
import { EmptyTable } from "../table/empty-table-companies";
import { ColumnSettings } from "../table/settings/columnSettings";
import { ExportListCompanies } from "./export-list-companies";

export const CompaniesPage = () => {
  const { data: session } = useSession();
  const { user } = session ?? {};

  const params = useQueryStates(tableCompaniesParams);
  const [{ search, id, desc }, setParams] = params;
  const columns = companiesColumns();

  const { data, isLoading, fetchNextPage } =
    trpc.companies.list.useInfiniteQuery(
      { search, id, desc },
      { getNextPageParam: (_, allPages) => allPages.length * 25 },
    );

  const { data: count } = trpc.companies.count.useQuery({ search });

  const companies = data?.pages.flat();
  const hasNextPage = data?.pages.at(-1)?.length === 25;

  const table = useTable({
    columns,
    data: companies ?? [],
    fetchNextPage,
    hasNextPage,
    isLoading,
    count,
    preferences: user?.companiesPreferences,
  });

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex h-12 shrink-0 items-center justify-between gap-2 px-3">
        <QueryInput
          placeholder="Search..."
          query={search}
          setQuery={(value) => setParams({ search: value })}
        />
        <div className="flex items-center gap-2">
          <ExportListCompanies companies={companies} />
          <ColumnSettings table={table} />
        </div>
      </div>
      <Separator />
      {companies?.length === 0 ? <EmptyTable /> : <DataTable table={table} />}
    </div>
  );
};

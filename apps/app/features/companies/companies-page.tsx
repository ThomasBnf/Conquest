"use client";

import { QueryInput } from "@/components/custom/query-input";
import { Companies } from "@/components/icons/Companies";
import { useCompanies } from "@/context/companiesContext";
import { useFilters } from "@/context/filtersContext";
import { tableParsers } from "@/lib/searchParamsTable";
import { Button } from "@conquest/ui/button";
import { useQueryStates } from "nuqs";
import { ColumnVisibility } from "../table/column-visibility";
import { companiesColumns } from "../table/companies-columns";
import { DataTable } from "../table/data-table";
import { useTable } from "../table/hooks/useTable";

export const CompaniesPage = () => {
  const { resetFilters } = useFilters();
  const [{ search, idCompany, descCompany }, setParams] =
    useQueryStates(tableParsers);
  const { data, count, isLoading } = useCompanies();

  const { table } = useTable({
    data: data ?? [],
    columns: companiesColumns,
    count: count ?? 0,
    left: ["name"],
    id: idCompany,
    desc: descCompany,
    type: "companies",
  });

  return (
    <div className="flex h-full flex-col divide-y overflow-hidden">
      <div className="flex h-12 shrink-0 items-center justify-between gap-2 px-4">
        <QueryInput
          placeholder="Search..."
          query={search}
          setQuery={(value) => setParams({ search: value })}
        />
        <ColumnVisibility table={table} type="companies" />
      </div>
      {data?.length === 0 ? (
        <div className="flex h-full flex-col items-center justify-center text-center">
          <Companies />
          <div className="mt-2 mb-4">
            <p className="font-medium text-base">No companies found</p>
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
        <DataTable table={table} count={count ?? 0} isLoading={isLoading} />
      )}
    </div>
  );
};

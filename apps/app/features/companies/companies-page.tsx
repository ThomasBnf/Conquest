"use client";

import { QueryInput } from "@/components/custom/query-input";
import { useCompanies } from "@/context/companiesContext";
import { useFilters } from "@/context/filtersContext";
import { tableParams } from "@/utils/tableParams";
import { Button } from "@conquest/ui/button";
import { Companies } from "@conquest/ui/icons/Companies";
import { useQueryStates } from "nuqs";
import { ColumnVisibility } from "../table/column-visibility";
import { companiesColumns } from "../table/companies-columns";
import { DataTable } from "../table/data-table";
import { useTable } from "../table/hooks/useTable";
import { ExportListCompanies } from "./export-list-companies";

export const CompaniesPage = () => {
  const { resetFilters } = useFilters();
  const [{ search, idCompany, descCompany }, setParams] =
    useQueryStates(tableParams);
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
      <div className="flex h-12 shrink-0 items-center justify-between gap-2 px-3">
        <QueryInput
          placeholder="Search..."
          query={search}
          setQuery={(value) => setParams({ search: value })}
        />
        <div className="flex items-center gap-2">
          <ExportListCompanies companies={data} />
          <ColumnVisibility table={table} type="companies" />
        </div>
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

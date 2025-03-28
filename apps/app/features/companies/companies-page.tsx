"use client";

import { QueryInput } from "@/components/custom/query-input";
import { useCompanies } from "@/context/companiesContext";
import { tableParams } from "@/utils/tableParams";
import { useQueryStates } from "nuqs";
import { ActionsMenu } from "../table/actions-menu";
import { ColumnVisibility } from "../table/column-visibility";
import { companiesColumns } from "../table/companies-columns";
import { DataTable } from "../table/data-table";
import { useTable } from "../table/hooks/useTable";
import { EmptyTable } from "./empty-table";
import { ExportListCompanies } from "./export-list-companies";

export const CompaniesPage = () => {
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
      <ActionsMenu table={table} />
      {data?.length === 0 ? (
        <EmptyTable />
      ) : (
        <DataTable table={table} count={count ?? 0} isLoading={isLoading} />
      )}
    </div>
  );
};

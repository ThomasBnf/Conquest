"use client";

import { tableParsers } from "@/lib/searchParamsTable";
import { trpc } from "@/server/client";
import type { Company } from "@conquest/zod/schemas/company.schema";
import { useQueryStates } from "nuqs";
import * as React from "react";
import { useFilters } from "./filtersContext";

type companiesContext = {
  data: Company[] | undefined;
  count: number | undefined;
  isLoading: boolean;
};

const CompaniesContext = React.createContext<companiesContext>(
  {} as companiesContext,
);

type Props = {
  children: React.ReactNode;
};

export const CompaniesProvider = ({ children }: Props) => {
  const { groupFilters } = useFilters();
  const [{ search, idCompany, descCompany, page, pageSize }] =
    useQueryStates(tableParsers);

  trpc.tags.list.useQuery();

  const { data, isLoading } = trpc.companies.list.useQuery({
    search,
    desc: descCompany,
    id: idCompany,
    page,
    pageSize,
    groupFilters,
  });

  const { data: count } = trpc.companies.countCompanies.useQuery({
    search,
    groupFilters,
  });

  return (
    <CompaniesContext.Provider
      value={{
        data,
        count,
        isLoading,
      }}
    >
      {children}
    </CompaniesContext.Provider>
  );
};

export const useCompanies = () => React.useContext(CompaniesContext);

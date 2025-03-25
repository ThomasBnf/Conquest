"use client";

import { trpc } from "@/server/client";
import { tableParams } from "@/utils/tableParams";
import type { Company } from "@conquest/zod/schemas/company.schema";
import { useQueryStates } from "nuqs";
import * as React from "react";

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
  const [{ search, idCompany, descCompany, page, pageSize }] =
    useQueryStates(tableParams);

  trpc.tags.list.useQuery();

  const { data, isLoading } = trpc.companies.list.useQuery({
    search,
    desc: descCompany,
    id: idCompany,
    page,
    pageSize,
  });

  const { data: count } = trpc.companies.countCompanies.useQuery({
    search,
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

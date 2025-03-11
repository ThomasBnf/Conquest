"use client";

import { tableParams } from "@/lib/searchParamsTable";
import { trpc } from "@/server/client";
import type { Member } from "@conquest/zod/schemas/member.schema";
import { useQueryStates } from "nuqs";
import * as React from "react";
import { useFilters } from "./filtersContext";

type membersContext = {
  data: Member[] | undefined;
  count: number | undefined;
  isLoading: boolean;
};

const MembersContext = React.createContext<membersContext>(
  {} as membersContext,
);

type Props = {
  children: React.ReactNode;
};

export const MembersProvider = ({ children }: Props) => {
  const { groupFilters } = useFilters();
  const [{ search, idMember, descMember, page, pageSize }] =
    useQueryStates(tableParams);

  trpc.levels.list.useQuery();
  trpc.tags.list.useQuery();
  trpc.companies.getAllCompanies.useQuery({});

  const { data, isFetching, failureReason } = trpc.members.list.useQuery({
    search,
    desc: descMember,
    id: idMember,
    page,
    pageSize,
    groupFilters,
  });
  console.log(failureReason);

  const { data: count } = trpc.members.count.useQuery({
    search,
    groupFilters,
  });

  return (
    <MembersContext.Provider
      value={{
        data,
        count,
        isLoading: isFetching,
      }}
    >
      {children}
    </MembersContext.Provider>
  );
};

export const useMembers = () => React.useContext(MembersContext);

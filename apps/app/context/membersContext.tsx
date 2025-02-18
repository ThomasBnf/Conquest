"use client";

import { tableParsers } from "@/lib/searchParamsTable";
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
    useQueryStates(tableParsers);

  trpc.levels.getAllLevels.useQuery();
  trpc.tags.getAllTags.useQuery();

  const { data, isLoading, failureReason } =
    trpc.members.getAllMembers.useQuery({
      search,
      desc: descMember,
      id: idMember,
      page,
      pageSize,
      groupFilters,
    });

  const { data: count } = trpc.members.countMembers.useQuery({
    search,
    groupFilters,
  });

  return (
    <MembersContext.Provider
      value={{
        data,
        count,
        isLoading,
      }}
    >
      {children}
    </MembersContext.Provider>
  );
};

export const useMembers = () => React.useContext(MembersContext);

"use client";

import { countMembers } from "@/client/members/countMembers";
import { listMembers } from "@/client/members/listMembers";
import { useUser } from "@/context/userContext";
import type { Filter } from "@conquest/zod/schemas/filters.schema";
import { useState } from "react";
import { MembersTable } from "../table/members-table";

type Props = {
  initialFilters?: Filter[];
};

export const Table = ({ initialFilters }: Props) => {
  const { members_preferences } = useUser();
  const [filters, setFilters] = useState<Filter[]>(
    initialFilters || members_preferences?.filters || [],
  );

  const { members, isLoading } = listMembers({ filters });
  const { count } = countMembers({ filters });

  return (
    <MembersTable
      members={members}
      isLoading={isLoading}
      count={count}
      filters={filters}
      setFilters={setFilters}
    />
  );
};

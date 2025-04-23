"use client";

import { QueryInput } from "@/components/custom/query-input";
import { InviteUser } from "@/features/team/invite-user";
import { useState } from "react";

export const HeaderTeam = () => {
  const [query, setQuery] = useState("");

  return (
    <div className="flex items-center justify-between">
      <QueryInput query={query} setQuery={setQuery} />
      <InviteUser />
    </div>
  );
};

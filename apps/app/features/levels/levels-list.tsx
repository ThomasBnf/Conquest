"use client";

import { QueryInput } from "@/components/custom/query-input";
import { IsLoading } from "@/components/states/is-loading";
import { trpc } from "@/server/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@conquest/ui/table";
import { Infinity as InfinityIcon } from "lucide-react";
import { useState } from "react";
import { CreateLevelDialog } from "./create-level-dialog";
import { EmptyLevels } from "./empty-levels";
import { MenuLevel } from "./menu-level";

export const LevelsList = () => {
  const { data, isLoading } = trpc.levels.getAllLevels.useQuery();
  const [query, setQuery] = useState("");

  if (isLoading) return <IsLoading />;
  if (data?.length === 0) return <EmptyLevels />;

  const filteredLevels =
    data?.filter((level) =>
      level.name.toLowerCase().includes(query.toLowerCase()),
    ) ?? [];

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <QueryInput query={query} setQuery={setQuery} />
        <CreateLevelDialog />
      </div>
      <div className="flex flex-col gap-1 overflow-hidden rounded-md border">
        <Table>
          <TableHeader className="border-b bg-muted">
            <TableRow>
              <TableHead className="min-w-[100px] px-3">Label</TableHead>
              <TableHead className="px-3">Number</TableHead>
              <TableHead className="px-3">From</TableHead>
              <TableHead className="px-3">To</TableHead>
              <TableHead className="px-3 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLevels.map((level) => (
              <TableRow key={level.id}>
                <TableCell className="font-medium">{level.name}</TableCell>
                <TableCell className="font-mono">{level.number}</TableCell>
                <TableCell className="text-muted-foreground">
                  {level.from}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {level.to ?? <InfinityIcon size={16} />}
                </TableCell>
                <TableCell className="text-right">
                  <MenuLevel level={level} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

"use client";

import { SourceBadge } from "@/components/badges/source-badge";
import { QueryInput } from "@/components/custom/query-input";
import { trpc } from "@/server/client";
import { Label } from "@conquest/ui/label";
import { Skeleton } from "@conquest/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@conquest/ui/table";
import type { Source } from "@conquest/zod/enum/source.enum";
import { Fragment, useState } from "react";
import { ConditionCard } from "./condition-card";
import { CreateActivityTypeDialog } from "./create-activity-type-dialog";
import { EmptyActivityTypes } from "./empty-activity-types";
import { MenuActivityType } from "./menu-activity-type";

type Props = {
  source?: Source;
  disableHeader?: boolean;
};

export const ActivityTypesList = ({ source, disableHeader = false }: Props) => {
  const [query, setQuery] = useState("");
  const { data, isLoading } = trpc.activityTypes.list.useQuery();

  if (isLoading) return <Skeleton className="h-[174.5px] w-full" />;
  if (!data?.length) return <EmptyActivityTypes />;

  const filteredActivityTypes = data.filter((activityType) => {
    const matchesSource = source ? activityType.source === source : true;
    const matchesQuery = query
      ? activityType.name.toLowerCase().includes(query.toLowerCase())
      : true;
    return matchesSource && matchesQuery;
  });

  return (
    <div className="flex flex-col gap-2">
      {!disableHeader && (
        <div className="flex items-center justify-between">
          <QueryInput query={query} setQuery={setQuery} />
          <CreateActivityTypeDialog />
        </div>
      )}
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader className="border-b bg-muted">
            <TableRow>
              <TableHead className="w-[100px] px-3">Source</TableHead>
              <TableHead className="px-3">Name</TableHead>
              <TableHead className="px-3">Key</TableHead>
              <TableHead className="px-3">Points</TableHead>
              <TableHead className="px-3 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredActivityTypes.map((activityType) => {
              const { source, name, key, conditions, points } = activityType;

              return (
                <Fragment key={activityType.id}>
                  <TableRow className="hover:bg-transparent">
                    <TableCell className="font-medium">
                      <SourceBadge source={source} />
                    </TableCell>
                    <TableCell className="font-medium">{name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {key}
                    </TableCell>
                    <TableCell>{points}</TableCell>
                    <TableCell className="text-right">
                      <MenuActivityType activityType={activityType} />
                    </TableCell>
                  </TableRow>
                  <TableRow className="border-b hover:bg-transparent">
                    {conditions.rules.length > 0 && (
                      <TableCell colSpan={5} className="pb-4">
                        <div className="flex flex-col gap-2">
                          <Label>Conditions</Label>
                          {conditions.rules.map((condition) => (
                            <ConditionCard
                              key={condition.channel_id}
                              activityType={activityType}
                              condition={condition}
                            />
                          ))}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                </Fragment>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

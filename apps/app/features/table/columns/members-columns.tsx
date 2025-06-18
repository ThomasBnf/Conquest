"use client";

import { CountryBadge } from "@/components/badges/country-badge";
import { LanguageBadge } from "@/components/badges/language-badge";
import { SourceBadge } from "@/components/badges/source-badge";
import { PulseBadge } from "@/features/members/pulse-badge";
import { useTable } from "@/hooks/useTable";
import { Badge } from "@conquest/ui/badge";
import { Checkbox } from "@conquest/ui/checkbox";
import { Level } from "@conquest/ui/icons/Level";
import { FullMember } from "@conquest/zod/schemas/member.schema";
import { DateCell } from "../cells/date-cell";
import { FullNameCell } from "../cells/full-name-cell";
import { ProfilesCell } from "../cells/profiles-cell";
import { TagsCell } from "../cells/tags-cell";
import { ColumnHeader } from "./column-header";

export type Column<TData> = {
  key: string;
  header: ({
    table,
  }: {
    table: ReturnType<typeof useTable<TData>>;
  }) => React.ReactNode;
  cell: ({
    item,
    table,
  }: {
    item: TData;
    table: ReturnType<typeof useTable<TData>>;
  }) => React.ReactNode;
  width: number;
  isFixed?: boolean;
};

export const membersColumns = (): Column<FullMember>[] => {
  return [
    {
      key: "name",
      header: ({ table }) => {
        const { data, isAllSelected, isSomeSelected, setSelectedRows } = table;

        return (
          <div className="flex items-center gap-3">
            <Checkbox
              checked={isAllSelected || (isSomeSelected && "indeterminate")}
              onCheckedChange={() => {
                if (isAllSelected) {
                  setSelectedRows([]);
                } else {
                  setSelectedRows(data ?? []);
                }
              }}
            />
            <ColumnHeader
              columnId="name"
              title="Members"
              type="string"
              isFixed
              table={table}
            />
          </div>
        );
      },
      cell: ({ item, table }) => {
        const { selectedRows, setSelectedRows } = table;

        return (
          <div className="flex items-center gap-3 overflow-hidden">
            <Checkbox
              checked={selectedRows.includes(item)}
              onCheckedChange={(value) =>
                setSelectedRows(
                  value
                    ? [...selectedRows, item]
                    : selectedRows.filter((m) => m.id !== item.id),
                )
              }
            />
            <FullNameCell member={item} />
          </div>
        );
      },
      width: 300,
      isFixed: true,
    },
    {
      key: "company",
      header: ({ table }) => (
        <ColumnHeader
          columnId="company"
          title="Company"
          type="string"
          table={table}
        />
      ),
      cell: ({ item }) => <p className="truncate">{item.company}</p>,
      width: 250,
    },
    {
      key: "tags",
      header: ({ table }) => (
        <ColumnHeader
          columnId="tags"
          title="Tags"
          type="string"
          table={table}
        />
      ),
      cell: ({ item }) => <TagsCell data={item} />,
      width: 250,
    },
    {
      key: "level",
      header: ({ table }) => (
        <ColumnHeader
          columnId="level"
          title="Level"
          type="number"
          table={table}
        />
      ),
      cell: ({ item }) => (
        <Badge variant="outline">
          <Level size={18} />
          {item.level ? (
            <p>
              {item.level} • {item.levelName}
            </p>
          ) : (
            <p className="text-muted-foreground">No level</p>
          )}
        </Badge>
      ),
      width: 200,
    },
    {
      key: "pulse",
      header: ({ table }) => (
        <ColumnHeader
          columnId="pulse"
          title="Pulse"
          type="number"
          table={table}
        />
      ),
      cell: ({ item }) => <PulseBadge member={item} />,
      width: 200,
    },
    {
      key: "profiles",
      header: ({ table }) => (
        <ColumnHeader columnId="profiles" title="Profiles" table={table} />
      ),
      cell: ({ item }) => <ProfilesCell member={item} />,
      width: 250,
    },
    {
      key: "jobTitle",
      header: ({ table }) => (
        <ColumnHeader
          columnId="jobTitle"
          title="Job title"
          type="string"
          table={table}
        />
      ),
      cell: ({ item }) => <p className="truncate">{item.jobTitle}</p>,
      width: 250,
    },
    {
      key: "primaryEmail",
      header: ({ table }) => (
        <ColumnHeader
          columnId="primaryEmail"
          title="Email"
          type="string"
          table={table}
        />
      ),
      cell: ({ item }) => <p className="truncate">{item.primaryEmail}</p>,
      width: 250,
    },
    {
      key: "language",
      header: ({ table }) => (
        <ColumnHeader
          columnId="language"
          title="Language"
          type="string"
          table={table}
        />
      ),
      cell: ({ item }) => <LanguageBadge language={item.language} />,
      width: 250,
    },
    {
      key: "country",
      header: ({ table }) => (
        <ColumnHeader
          columnId="country"
          title="Country"
          type="string"
          table={table}
        />
      ),
      cell: ({ item }) => <CountryBadge country={item.country} />,
      width: 250,
    },
    {
      key: "firstActivity",
      header: ({ table }) => (
        <ColumnHeader
          columnId="firstActivity"
          title="First activity"
          type="Date"
          table={table}
        />
      ),
      cell: ({ item }) => <DateCell date={item.firstActivity} />,
      width: 250,
    },
    {
      key: "lastActivity",
      header: ({ table }) => (
        <ColumnHeader
          columnId="lastActivity"
          title="Last activity"
          type="Date"
          table={table}
        />
      ),
      cell: ({ item }) => <DateCell date={item.lastActivity} />,
      width: 250,
    },
    {
      key: "source",
      header: ({ table }) => (
        <ColumnHeader
          columnId="source"
          title="Source"
          type="string"
          table={table}
        />
      ),
      cell: ({ item }) => <SourceBadge source={item.source} />,
      width: 250,
    },
    {
      key: "createdAt",
      header: ({ table }) => (
        <ColumnHeader
          columnId="createdAt"
          title="Created at"
          type="Date"
          table={table}
        />
      ),
      cell: ({ item }) => <DateCell date={item.createdAt} />,
      width: 250,
    },
  ];
};

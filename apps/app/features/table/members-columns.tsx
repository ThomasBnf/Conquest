"use client";

import { CountryBadge } from "@/components/badges/country-badge";
import { LanguageBadge } from "@/components/badges/language-badge";
import { SourceBadge } from "@/components/badges/source-badge";
import { DateCell } from "@/features/table/cells/date-cell";
import { Checkbox } from "@conquest/ui/checkbox";
import type { Member } from "@conquest/zod/schemas/member.schema";
import type { ColumnDef } from "@tanstack/react-table";
import { LevelBadge } from "../members/level-badge";
import { PulseBadge } from "../members/pulse-badge";
import { CompanyCell } from "./cells/company-cell";
import { FullNameCell } from "./cells/full-name-cell";
import { ProfilesCell } from "./cells/profiles-cell";
import { TagsCell } from "./cells/tags-cell";
import { ColumnHeader } from "./column-header";

export const membersColumns: ColumnDef<Member>[] = [
  {
    accessorKey: "full_name",
    header: ({ table, column }) => (
      <div className="flex items-center gap-3 pl-3">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        />
        <ColumnHeader table={table} column={column} title="Full Name" />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-3 overflow-hidden px-3 py-2">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
        />
        <FullNameCell row={row} />
      </div>
    ),
    size: 285,
    enableHiding: false,
  },
  {
    accessorKey: "company",
    header: ({ table, column }) => (
      <ColumnHeader table={table} column={column} title="Company" />
    ),
    cell: ({ row }) => <CompanyCell row={row} />,
    size: 250,
  },
  {
    accessorKey: "tags",
    header: ({ table, column }) => (
      <ColumnHeader table={table} column={column} title="Tags" />
    ),
    cell: ({ row }) => <TagsCell row={row} />,
    size: 250,
  },
  {
    accessorKey: "level",
    header: ({ table, column }) => (
      <ColumnHeader table={table} column={column} title="Level" />
    ),
    cell: ({ row }) => (
      <div className="p-2">
        <LevelBadge member={row.original} isBadge={false} />
      </div>
    ),
    size: 250,
  },
  {
    accessorKey: "pulse",
    header: ({ table, column }) => (
      <ColumnHeader table={table} column={column} title="Pulse" />
    ),
    cell: ({ row }) => (
      <div className="p-2">
        <PulseBadge member={row.original} />
      </div>
    ),
    size: 250,
  },
  {
    accessorKey: "profiles",
    header: ({ table, column }) => (
      <ColumnHeader table={table} column={column} title="Profiles" />
    ),
    cell: ({ row }) => <ProfilesCell row={row} />,
    size: 250,
  },
  {
    accessorKey: "job_title",
    header: ({ table, column }) => (
      <ColumnHeader table={table} column={column} title="Job Title" />
    ),
    cell: ({ row }) => <p className="truncate p-2">{row.original.job_title}</p>,
    size: 250,
  },
  {
    accessorKey: "primary_email",
    header: ({ table, column }) => (
      <ColumnHeader table={table} column={column} title="Email" />
    ),
    cell: ({ row }) => (
      <p className="truncate p-2">{row.original.primary_email}</p>
    ),
    size: 250,
  },
  {
    accessorKey: "language",
    header: ({ table, column }) => (
      <ColumnHeader table={table} column={column} title="Language" />
    ),
    cell: ({ row }) => (
      <LanguageBadge language={row.original.language} className="m-2" />
    ),
    size: 250,
  },
  {
    accessorKey: "country",
    header: ({ table, column }) => (
      <ColumnHeader table={table} column={column} title="Country" />
    ),
    cell: ({ row }) => (
      <CountryBadge country={row.original.country} className="m-2" />
    ),
    size: 250,
  },
  {
    accessorKey: "first_activity",
    header: ({ table, column }) => (
      <ColumnHeader table={table} column={column} title="First activity" />
    ),
    cell: ({ row }) => {
      if (!row.original.first_activity) return;
      return <DateCell date={row.original.first_activity} />;
    },
    size: 250,
  },
  {
    accessorKey: "last_activity",
    header: ({ table, column }) => (
      <ColumnHeader table={table} column={column} title="Last activity" />
    ),
    cell: ({ row }) => {
      if (!row.original.last_activity) return;
      return <DateCell date={row.original.last_activity} />;
    },
    size: 250,
  },
  {
    accessorKey: "source",
    header: ({ table, column }) => (
      <ColumnHeader table={table} column={column} title="Source" />
    ),
    cell: ({ row }) => (
      <div className="p-2">
        <SourceBadge source={row.original.source} />
      </div>
    ),
    size: 250,
  },
  {
    accessorKey: "created_at",
    header: ({ table, column }) => (
      <ColumnHeader table={table} column={column} title="Created at" />
    ),
    cell: ({ row }) => <DateCell date={row.original.created_at} />,
    size: 250,
  },
];

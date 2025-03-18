"use client";

import { Checkbox } from "@conquest/ui/checkbox";
import type { Company } from "@conquest/zod/schemas/company.schema";
import type { ColumnDef } from "@tanstack/react-table";
import { format, formatDistanceToNow } from "date-fns";
import { CompanyNameCell } from "./cells/company-name-cell";
import { TagsCellCompany } from "./cells/tags-cell-company";
import { ColumnHeader } from "./column-header";

export const companiesColumns: ColumnDef<Company>[] = [
  {
    accessorKey: "name",
    header: ({ table, column }) => (
      <div className="flex items-center gap-3 pl-3">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        />
        <ColumnHeader table={table} column={column} title="Name" />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-3 overflow-hidden px-3 py-2">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
        />
        <CompanyNameCell row={row} />
      </div>
    ),
    size: 285,
    enableHiding: false,
  },
  {
    accessorKey: "tags",
    header: ({ table, column }) => (
      <ColumnHeader table={table} column={column} title="Tags" />
    ),
    cell: ({ row }) => <TagsCellCompany row={row} />,
    size: 250,
  },
  {
    accessorKey: "domain",
    header: ({ table, column }) => (
      <ColumnHeader table={table} column={column} title="Domain" />
    ),
    cell: ({ row }) => <p className="truncate p-2">{row.original.domain}</p>,
    size: 250,
  },
  {
    accessorKey: "industry",
    header: ({ table, column }) => (
      <ColumnHeader table={table} column={column} title="Industry" />
    ),
    cell: ({ row }) => <p className="truncate p-2">{row.original.industry}</p>,
    size: 250,
  },
  {
    accessorKey: "employees",
    header: ({ table, column }) => (
      <ColumnHeader table={table} column={column} title="Employees" />
    ),
    cell: ({ row }) => <p className="truncate p-2">{row.original.employees}</p>,
    size: 250,
  },
  {
    accessorKey: "founded_at",
    header: ({ table, column }) => (
      <ColumnHeader table={table} column={column} title="Founded at" />
    ),
    cell: ({ row }) => {
      if (!row.original.founded_at) return;
      return (
        <p className="truncate p-2">
          {formatDistanceToNow(row.original.founded_at)}
        </p>
      );
    },
    size: 250,
  },
  {
    accessorKey: "created_at",
    header: ({ table, column }) => (
      <ColumnHeader table={table} column={column} title="Created at" />
    ),
    cell: ({ row }) => (
      <p className="truncate p-2">{format(row.original.created_at, "PP")}</p>
    ),
    size: 250,
  },
];

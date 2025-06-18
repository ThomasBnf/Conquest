"use client";

import { SourceBadge } from "@/components/badges/source-badge";
import { useTable } from "@/hooks/useTable";
import { Checkbox } from "@conquest/ui/checkbox";
import { Company } from "@conquest/zod/schemas/company.schema";
import { DateCell } from "../cells/date-cell";
import { NameCell } from "../cells/name-cell";
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

export const companiesColumns = (): Column<Company>[] => {
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
              title="Companies"
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
            <NameCell company={item} />
          </div>
        );
      },
      width: 300,
      isFixed: true,
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
      key: "domain",
      header: ({ table }) => (
        <ColumnHeader
          columnId="domain"
          title="Domain"
          type="string"
          table={table}
        />
      ),
      cell: ({ item }) => <p className="truncate">{item.domain}</p>,
      width: 200,
    },
    {
      key: "industry",
      header: ({ table }) => (
        <ColumnHeader
          columnId="industry"
          title="Industry"
          type="string"
          table={table}
        />
      ),
      cell: ({ item }) => <p className="truncate">{item.industry}</p>,
      width: 200,
    },
    {
      key: "employees",
      header: ({ table }) => (
        <ColumnHeader columnId="employees" title="Employees" table={table} />
      ),
      cell: ({ item }) => <p className="truncate">{item.employees}</p>,
      width: 250,
    },
    {
      key: "foundedAt",
      header: ({ table }) => (
        <ColumnHeader
          columnId="founded_at"
          title="Founded at"
          type="Date"
          table={table}
        />
      ),
      cell: ({ item }) => <DateCell date={item.foundedAt} />,
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
      key: "created_at",
      header: ({ table }) => (
        <ColumnHeader
          columnId="created_at"
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

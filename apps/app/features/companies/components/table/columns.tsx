import { DateCell } from "@/components/custom/date-cell";
import { ColumnHeader } from "@/features/table/column-header";
import { buttonVariants } from "@conquest/ui/button";
import { Checkbox } from "@conquest/ui/checkbox";
import { cn } from "@conquest/ui/cn";
import type { Company } from "@conquest/zod/company.schema";
import { slug } from "cuid";
import Link from "next/link";
import type { Dispatch, SetStateAction } from "react";

type Column = {
  id: string;
  header: (args: {
    companies?: Company[];
    rowSelected?: string[];
    setRowSelected?: Dispatch<SetStateAction<string[]>>;
  }) => React.ReactNode;
  cell: (args: {
    company: Company;
    rowSelected?: string[];
    setRowSelected?: Dispatch<SetStateAction<string[]>>;
  }) => React.ReactNode;
  width: number;
};

export const Columns = (): Column[] => [
  {
    id: "select",
    header: ({ companies, rowSelected, setRowSelected }) => (
      <div className="flex items-center justify-center size-12 bg-muted">
        <Checkbox
          checked={
            !rowSelected?.length
              ? false
              : rowSelected.length === companies?.length
                ? true
                : "indeterminate"
          }
          onClick={(e) => {
            e.stopPropagation();
            if (rowSelected?.length === companies?.length) {
              setRowSelected?.([]);
            } else {
              setRowSelected?.(companies?.map((company) => company.id) ?? []);
            }
          }}
        />
      </div>
    ),
    cell: ({ company, rowSelected, setRowSelected }) => (
      <div className="flex items-center justify-center size-12">
        <Checkbox
          checked={rowSelected?.includes(company.id)}
          onCheckedChange={(checked) =>
            setRowSelected?.(
              checked
                ? [...(rowSelected ?? []), company.id]
                : (rowSelected ?? []).filter((id) => id !== company.id),
            )
          }
        />
      </div>
    ),
    width: 40,
  },
  {
    id: "name",
    header: () => <ColumnHeader id="name" title="Name" width={285} />,
    cell: ({ company }) => (
      <Link
        href={`/${slug}/companies/${company.id}`}
        className={cn(
          buttonVariants({ variant: "ghost" }),
          "flex items-center gap-2 px-1.5 truncate",
        )}
      >
        <p className="font-medium truncate">{company.name}</p>
      </Link>
    ),
    width: 285,
  },
  {
    id: "domain",
    header: () => <ColumnHeader id="domain" title="Website" width={285} />,
    cell: ({ company }) => (
      <p className="font-medium truncate px-2">https://{company.domain}</p>
    ),
    width: 285,
  },
  {
    id: "industry",
    header: () => <ColumnHeader id="industry" title="Industry" width={285} />,
    cell: ({ company }) => (
      <p className="font-medium truncate px-2">{company.description}</p>
    ),
    width: 285,
  },
  {
    id: "description",
    header: () => (
      <ColumnHeader id="description" title="Description" width={285} />
    ),
    cell: ({ company }) => (
      <p className="font-medium truncate">{company.description}</p>
    ),
    width: 285,
  },
  {
    id: "employees",
    header: () => (
      <ColumnHeader id="employees" title="# Employees" width={285} />
    ),
    cell: ({ company }) => (
      <p className="font-medium truncate px-2">{company.employees}</p>
    ),
    width: 285,
  },
  {
    id: "founded_at",
    header: () => (
      <ColumnHeader id="founded_at" title="Founded at" width={285} />
    ),
    cell: ({ company }) => <DateCell date={company.founded_at} />,
    width: 285,
  },
  {
    id: "created_at",
    header: () => (
      <ColumnHeader id="created_at" title="Created at" width={285} />
    ),
    cell: ({ company }) => <DateCell date={company.created_at} />,
    width: 285,
  },
  {
    id: "source",
    header: () => <ColumnHeader id="source" title="Source" width={250} />,
    cell: ({ company }) => <p className="truncate px-2">{company.source}</p>,
    width: 250,
  },
];

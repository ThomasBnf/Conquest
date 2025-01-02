import { DateCell } from "@/components/custom/date-cell";
import { SourceBadge } from "@/components/custom/source-badge";
import { useUser } from "@/context/userContext";
import { ColumnHeader } from "@/features/table/column-header";
import { buttonVariants } from "@conquest/ui/button";
import { Checkbox } from "@conquest/ui/checkbox";
import { cn } from "@conquest/ui/cn";
import type { Company } from "@conquest/zod/schemas/company.schema";
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
      <div className="flex size-12 items-center justify-center bg-muted">
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
      <div className="flex size-12 items-center justify-center">
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
    cell: ({ company }) => {
      const { slug } = useUser();
      return (
        <Link
          href={`/${slug}/companies/${company.id}`}
          className={cn(
            buttonVariants({ variant: "ghost" }),
            "flex items-center gap-2 truncate px-1.5",
          )}
        >
          <p className="truncate font-medium">{company.name}</p>
        </Link>
      );
    },
    width: 285,
  },
  {
    id: "domain",
    header: () => <ColumnHeader id="domain" title="Website" width={250} />,
    cell: ({ company }) => (
      <p className="truncate px-2 font-medium">https://{company.domain}</p>
    ),
    width: 250,
  },
  {
    id: "industry",
    header: () => <ColumnHeader id="industry" title="Industry" width={250} />,
    cell: ({ company }) => (
      <p className="truncate px-2 font-medium">{company.industry}</p>
    ),
    width: 250,
  },
  {
    id: "employees",
    header: () => (
      <ColumnHeader id="employees" title="# Employees" width={250} />
    ),
    cell: ({ company }) => (
      <p className="truncate px-2 font-medium">{company.employees}</p>
    ),
    width: 250,
  },
  {
    id: "founded_at",
    header: () => (
      <ColumnHeader id="founded_at" title="Founded at" width={250} />
    ),
    cell: ({ company }) => <DateCell date={company.founded_at} />,
    width: 250,
  },
  {
    id: "created_at",
    header: () => (
      <ColumnHeader id="created_at" title="Created at" width={250} />
    ),
    cell: ({ company }) => <DateCell date={company.created_at} />,
    width: 250,
  },
  {
    id: "source",
    header: () => <ColumnHeader id="source" title="Source" width={250} />,
    cell: ({ company }) => (
      <div className="px-2">
        <SourceBadge source={company.source} />
      </div>
    ),
    width: 250,
  },
];

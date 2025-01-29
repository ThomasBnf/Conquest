import { DateCell } from "@/components/custom/date-cell";
import { ColumnHeader } from "@/features/table/column-header";
import { buttonVariants } from "@conquest/ui/button";
import { Checkbox } from "@conquest/ui/checkbox";
import { cn } from "@conquest/ui/cn";
import type { Company } from "@conquest/zod/schemas/company.schema";
import type { Tag } from "@conquest/zod/schemas/tag.schema";
import Link from "next/link";
import type { Dispatch, SetStateAction } from "react";
import { TagsCell } from "../table/tags-cell";

export type CompaniesColumn = {
  id: string;
  header: (args: {
    companies?: Company[];
    rowSelected?: string[];
    setRowSelected?: Dispatch<SetStateAction<string[]>>;
  }) => React.ReactNode;
  cell: (args: {
    slug?: string;
    company: Company;
    rowSelected?: string[];
    setRowSelected?: Dispatch<SetStateAction<string[]>>;
  }) => React.ReactNode;
  width: number;
};

type Props = {
  tags: Tag[] | undefined;
};

export const Columns = ({ tags }: Props): CompaniesColumn[] => [
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
    ),
    width: 40,
  },
  {
    id: "name",
    header: () => <ColumnHeader id="name" title="Name" width={285} />,
    cell: ({ slug, company }) => {
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
    id: "tags",
    header: () => <ColumnHeader id="tags" title="Tags" width={250} />,
    cell: ({ company }) => {
      const companyTags = tags?.filter((tag) => company.tags?.includes(tag.id));

      return (
        <TagsCell
          id={company.id}
          initialTags={companyTags ?? []}
          table="companies"
        />
      );
    },
    width: 250,
  },
  {
    id: "domain",
    header: () => <ColumnHeader id="domain" title="Website" width={250} />,
    cell: ({ company }) => (
      <p className="truncate p-2 font-medium">{company.domain}</p>
    ),
    width: 250,
  },
  {
    id: "industry",
    header: () => <ColumnHeader id="industry" title="Industry" width={250} />,
    cell: ({ company }) => (
      <p className="truncate p-2 font-medium">{company.industry}</p>
    ),
    width: 250,
  },
  {
    id: "employees",
    header: () => (
      <ColumnHeader id="employees" title="# Employees" width={250} />
    ),
    cell: ({ company }) => (
      <p className="truncate p-2 font-medium">{company.employees}</p>
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
];

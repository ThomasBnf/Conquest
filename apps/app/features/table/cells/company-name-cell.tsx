import { useUser } from "@/context/userContext";
import { buttonVariants } from "@conquest/ui/button";
import { cn } from "@conquest/ui/cn";
import type { Company } from "@conquest/zod/schemas/company.schema";
import type { Row } from "@tanstack/react-table";
import Link from "next/link";

type Props = {
  row: Row<Company>;
};

export const CompanyNameCell = ({ row }: Props) => {
  const { slug } = useUser();
  const { id, name } = row.original;

  return (
    <Link
      href={`/${slug}/companies/${id}`}
      className={cn(buttonVariants({ variant: "ghost" }), "truncate pl-1")}
    >
      <p className="ml-2 truncate font-medium">{name}</p>
    </Link>
  );
};

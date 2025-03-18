import { buttonVariants } from "@conquest/ui/button";
import { cn } from "@conquest/ui/cn";
import type { Company } from "@conquest/zod/schemas/company.schema";
import type { Row } from "@tanstack/react-table";
import { useSession } from "next-auth/react";
import Link from "next/link";

type Props = {
  row: Row<Company>;
};

export const CompanyNameCell = ({ row }: Props) => {
  const { data: session } = useSession();
  const { slug } = session?.user.workspace ?? {};
  const { id, name } = row.original;

  return (
    <Link
      href={`/${slug}/companies/${id}`}
      className={cn(buttonVariants({ variant: "ghost" }), "truncate pl-1")}
      prefetch
    >
      <p className="ml-2 truncate font-medium">{name}</p>
    </Link>
  );
};

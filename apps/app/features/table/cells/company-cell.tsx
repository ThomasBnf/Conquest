import { trpc } from "@/server/client";
import { Skeleton } from "@conquest/ui/skeleton";
import type { Member } from "@conquest/zod/schemas/member.schema";
import type { Row } from "@tanstack/react-table";

type Props = {
  row: Row<Member>;
};

export const CompanyCell = ({ row }: Props) => {
  const { data, isLoading } = trpc.companies.getAllCompanies.useQuery({});
  const company = data?.find(
    (company) => company.id === row.original.company_id,
  );

  return (
    <p className="truncate p-2">
      {isLoading ? <Skeleton className="h-4 w-24" /> : company?.name}
    </p>
  );
};

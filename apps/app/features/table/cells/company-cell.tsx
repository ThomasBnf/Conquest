import { trpc } from "@/server/client";
import { Skeleton } from "@conquest/ui/skeleton";
import type { Member } from "@conquest/zod/schemas/member.schema";
import { skipToken } from "@tanstack/react-query";
import type { Row } from "@tanstack/react-table";

type Props = {
  row: Row<Member>;
};

export const CompanyCell = ({ row }: Props) => {
  const { data, isLoading } = trpc.companies.get.useQuery(
    row.original.company_id ? { id: row.original.company_id } : skipToken,
  );

  return (
    <div className="truncate p-2">
      {isLoading ? (
        <Skeleton className="h-4 w-24" />
      ) : (
        <p className="truncate">{data?.name}</p>
      )}
    </div>
  );
};

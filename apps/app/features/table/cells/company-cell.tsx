import { trpc } from "@/server/client";
import { Skeleton } from "@conquest/ui/skeleton";
import type { Member } from "@conquest/zod/schemas/member.schema";
import type { Row } from "@tanstack/react-table";

type Props = {
  row: Row<Member>;
};

export const CompanyCell = ({ row }: Props) => {
  const { data, isLoading } = trpc.companies.get.useQuery(
    { id: row.original.company_id ?? "" },
    { enabled: !!row.original.company_id },
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

import { trpc } from "@/server/client";
import { Skeleton } from "@conquest/ui/skeleton";
import type { Member } from "@conquest/zod/schemas/member.schema";
import { skipToken } from "@tanstack/react-query";

type Props = {
  member: Member;
};

export const CompanyCell = ({ member }: Props) => {
  const { company_id } = member;

  const { data, isLoading } = trpc.companies.get.useQuery(
    company_id ? { id: company_id } : skipToken,
  );

  return isLoading ? (
    <Skeleton className="h-5 w-24" />
  ) : (
    <p className="truncate">{data?.name}</p>
  );
};

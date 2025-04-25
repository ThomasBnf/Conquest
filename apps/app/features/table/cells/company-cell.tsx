import { trpc } from "@/server/client";
import { Skeleton } from "@conquest/ui/skeleton";
import type { Member } from "@conquest/zod/schemas/member.schema";
import { skipToken } from "@tanstack/react-query";

type Props = {
  member: Member;
};

export const CompanyCell = ({ member }: Props) => {
  const { companyId } = member;

  const { data, isLoading } = trpc.companies.get.useQuery(
    companyId ? { id: companyId } : skipToken,
  );

  return isLoading ? (
    <Skeleton className="h-5 w-24" />
  ) : (
    <p className="truncate">{data?.name}</p>
  );
};

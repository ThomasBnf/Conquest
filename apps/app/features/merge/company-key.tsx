import { trpc } from "@/server/client";
import { RadioGroupItem } from "@conquest/ui/radio-group";
import type { Member } from "@conquest/zod/schemas/member.schema";
import { skipToken } from "@tanstack/react-query";

type Props = {
  companyId: string | null;
  finalMember: Member;
  setFinalMember: (member: Member) => void;
};

export const CompanyKey = ({
  companyId,
  finalMember,
  setFinalMember,
}: Props) => {
  const { data: company } = trpc.companies.get.useQuery(
    companyId ? { id: companyId } : skipToken,
  );

  if (!companyId) return;

  return (
    <div key={companyId} className="flex items-center gap-2">
      <RadioGroupItem
        value={companyId}
        checked={finalMember.companyId === companyId}
        onClick={() => setFinalMember({ ...finalMember, companyId })}
      />
      <p key={companyId}>
        {company?.name ?? <span className="text-muted-foreground">N/A</span>}
      </p>
    </div>
  );
};

import { trpc } from "@/server/client";
import { RadioGroupItem } from "@conquest/ui/radio-group";
import type { Member } from "@conquest/zod/schemas/member.schema";
import { skipToken } from "@tanstack/react-query";
type Props = {
  company_id: string | null;
  finalMember: Member;
  setFinalMember: (member: Member) => void;
};

export const CompanyKey = ({
  company_id,
  finalMember,
  setFinalMember,
}: Props) => {
  const { data: company } = trpc.companies.get.useQuery(
    company_id ? { id: company_id } : skipToken,
  );

  if (!company_id) return;

  return (
    <div key={company_id} className="flex items-center gap-2">
      <RadioGroupItem
        value={company_id}
        checked={finalMember.company_id === company_id}
        onClick={() => setFinalMember({ ...finalMember, company_id })}
      />
      <p key={company_id}>
        {company?.name ?? <span className="text-muted-foreground">N/A</span>}
      </p>
    </div>
  );
};

"use client";

import { calculateMemberMetrics } from "@/queries/members/calculateMemberMetrics";
import { Button } from "@conquest/ui/src/components/button";
import type { Member } from "@conquest/zod/schemas/member.schema";

type Props = {
  member: Member;
};

export const ButtonMetrics = ({ member }: Props) => {
  const onClick = async () => {
    await calculateMemberMetrics({ member });
  };
  return <Button onClick={onClick}>Metrics</Button>;
};

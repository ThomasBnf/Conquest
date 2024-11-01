"use client";

import { Button } from "@conquest/ui/button";
import type { MemberWithActivities } from "@conquest/zod/activity.schema";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { MemberMenu } from "./member-menu";

type Props = {
  member: MemberWithActivities;
};

export const MemberHeader = ({ member }: Props) => {
  const router = useRouter();

  return (
    <div className="flex items-center justify-between">
      <Button variant="ghost" size="icon" onClick={() => router.back()}>
        <ArrowLeft size={16} />
      </Button>
      <MemberMenu member={member} />
    </div>
  );
};

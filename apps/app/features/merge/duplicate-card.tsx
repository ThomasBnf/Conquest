import { getFinalMember } from "@/features/merge/helpers/getFinalMember";
import { trpc } from "@/server/client";
import { Button } from "@conquest/ui/button";
import { ScrollArea, ScrollBar } from "@conquest/ui/scroll-area";
import { Duplicate } from "@conquest/zod/schemas/duplicate.schema";
import { Member } from "@conquest/zod/schemas/member.schema";
import { skipToken } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { FinalMemberCard } from "./final-member-card";
import { MemberCard } from "./member-card";

type Props = {
  duplicate: Duplicate;
};

export const DuplicateCard = ({ duplicate }: Props) => {
  const [loading, setLoading] = useState(false);
  const [finalMember, setFinalMember] = useState<Member | null>(null);
  const utils = trpc.useUtils();

  const { data: members, failureReason } = trpc.members.listById.useQuery({
    ids: duplicate.member_ids,
  });

  console.log("members", failureReason);

  const { data: profiles, failureReason: profilesFailureReason } =
    trpc.profiles.members.useQuery(
      members ? { members: members ?? [] } : skipToken,
    );

  console.log("profiles", profilesFailureReason);

  const { mutate: mergeMembers } = trpc.duplicate.merge.useMutation({
    onSuccess: (data) => {
      const { id } = data ?? {};

      if (id) {
        utils.profiles.list.invalidate({ member_id: id });
        utils.members.invalidate();
        utils.duplicate.invalidate();
      }
    },
    onSettled: () => {
      setLoading(false);
    },
  });

  const { mutate: ignoreDuplicate } = trpc.duplicate.ignore.useMutation({
    onSuccess: () => {
      utils.duplicate.invalidate();
      setLoading(false);
    },
  });

  const onMerge = async () => {
    setLoading(true);
    mergeMembers({ duplicate, members, finalMember });
  };

  const onIgnore = async () => {
    setLoading(true);
    ignoreDuplicate({ duplicate });
  };

  useEffect(() => {
    if (members) setFinalMember(getFinalMember({ members }));
  }, [members]);

  if (!members || !profiles) return null;

  return (
    <div className="divide-y overflow-hidden rounded-md border">
      <div className="flex items-center justify-between py-4 pr-4">
        <ScrollArea className="h-fit">
          <div className="flex flex-1 gap-4 p-4">
            {members.map((member) => (
              <MemberCard
                key={member.id}
                member={member}
                profiles={profiles?.filter(
                  (profile) => profile.member_id === member.id,
                )}
              />
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
        <FinalMemberCard
          members={members}
          finalMember={finalMember}
          setFinalMember={setFinalMember}
          profiles={profiles}
        />
      </div>
      <div className="flex items-center justify-end gap-2 bg-sidebar p-2">
        <Button variant="outline" onClick={onIgnore} disabled={loading}>
          Ignore
        </Button>
        <Button onClick={onMerge} disabled={loading}>
          {loading ? <Loader2 size={16} className="animate-spin" /> : "Merge"}
        </Button>
      </div>
    </div>
  );
};

import { getFinalMember } from "@/features/merge/helpers/getFinalMember";
import { trpc } from "@/server/client";
import { Button } from "@conquest/ui/button";
import { ScrollArea, ScrollBar } from "@conquest/ui/scroll-area";
import { Duplicate } from "@conquest/zod/schemas/duplicate.schema";
import {
  Member,
  MemberWithProfiles,
} from "@conquest/zod/schemas/member.schema";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { FinalMemberCard } from "./final-member-card";
import { MemberCard } from "./member-card";
import { SkeletonDuplicate } from "./skeleton-duplicate";

type Props = {
  duplicate: Duplicate;
  onReset?: () => void;
};

export const DuplicateCard = ({ duplicate, onReset }: Props) => {
  const { member_ids } = duplicate;
  const [loading, setLoading] = useState(false);
  const [loadingIgnore, setLoadingIgnore] = useState(false);
  const [finalMember, setFinalMember] = useState<Member | null>(null);
  const [membersChecked, setMembersChecked] = useState<
    {
      member: MemberWithProfiles;
      checked: boolean;
    }[]
  >([]);
  const utils = trpc.useUtils();

  const { data, isLoading } = trpc.members.listWithProfiles.useQuery({
    ids: member_ids,
  });

  const { mutateAsync: mergeMembers } = trpc.duplicate.merge.useMutation({
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
      setLoadingIgnore(false);
    },
  });

  const onMerge = async () => {
    setLoading(true);
    const members = membersChecked.map(({ member }) => member);
    await mergeMembers({ members, finalMember });
    onReset?.();
  };

  const onIgnore = async () => {
    setLoadingIgnore(true);
    ignoreDuplicate({ duplicate });
    onReset?.();
  };

  const onCheckChange = (id: string, checked: boolean) => {
    setMembersChecked((prev) => {
      const newMembersChecked = prev.map((item) =>
        item.member.id === id ? { ...item, checked } : item,
      );

      const checkedMembers = newMembersChecked
        .filter((item) => item.checked)
        .map((item) => item.member);

      setFinalMember(getFinalMember({ members: checkedMembers }));

      return newMembersChecked;
    });
  };

  useEffect(() => {
    if (data) {
      setMembersChecked(data.map((member) => ({ member, checked: true })));
      setFinalMember(getFinalMember({ members: data }));
    }
  }, [data]);

  if (isLoading) return <SkeletonDuplicate />;

  return (
    <div className="divide-y overflow-hidden rounded-md border bg-background">
      <div className="flex items-center justify-between py-4 pr-4">
        <ScrollArea className="h-fit">
          <div className="flex flex-1 gap-4 p-4">
            {membersChecked.map(({ member, checked }) => (
              <MemberCard
                key={member.id}
                memberChecked={{ member, checked }}
                onCheckChange={onCheckChange}
              />
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
        <FinalMemberCard
          membersChecked={membersChecked}
          finalMember={finalMember}
          setFinalMember={setFinalMember}
        />
      </div>
      <div className="flex items-center justify-end gap-2 bg-sidebar p-2">
        <Button variant="outline" onClick={onIgnore} disabled={loadingIgnore}>
          {loadingIgnore ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            "Ignore"
          )}
        </Button>
        <Button onClick={onMerge} disabled={loading}>
          {loading ? <Loader2 size={16} className="animate-spin" /> : "Merge"}
        </Button>
      </div>
    </div>
  );
};

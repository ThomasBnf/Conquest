import { trpc } from "@/server/client";
import { Button } from "@conquest/ui/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@conquest/ui/dialog";
import { ScrollArea, ScrollBar } from "@conquest/ui/scroll-area";
import {
  Member,
  MemberWithProfiles,
} from "@conquest/zod/schemas/member.schema";
import { Loader2, Merge } from "lucide-react";
import { useEffect, useState } from "react";
import { FinalMemberCard } from "./final-member-card";
import { getFinalMember } from "./helpers/getFinalMember";
import { MemberCard } from "./member-card";

type Props = {
  members: Member[];
  onReset: () => void;
};

export const MergeDialog = ({ members, onReset }: Props) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [finalMember, setFinalMember] = useState<Member | null>(null);
  const [membersChecked, setMembersChecked] = useState<
    {
      member: MemberWithProfiles;
      checked: boolean;
    }[]
  >([]);
  const utils = trpc.useUtils();

  const { data, isLoading } = trpc.members.listWithProfiles.useQuery({
    ids: members.map((member) => member.id),
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

  const onMerge = async () => {
    setLoading(true);
    const members = membersChecked.map(({ member }) => member);
    await mergeMembers({ members, finalMember });
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

  const onCancel = () => {
    setOpen(false);
    onReset();
  };

  useEffect(() => {
    if (data) {
      setMembersChecked(data.map((member) => ({ member, checked: true })));
      setFinalMember(getFinalMember({ members: data }));
    }
  }, [data]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Merge size={16} />
          Merge
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[95vw]">
        <DialogHeader>
          <DialogTitle>Merge members</DialogTitle>
          <DialogDescription>
            You're about to merge {members.length} members.
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
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
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button disabled={loading} onClick={onMerge}>
            {loading ? <Loader2 className="size-4 animate-spin" /> : "Merge"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

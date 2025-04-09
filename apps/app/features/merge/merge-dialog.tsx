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
import { Member } from "@conquest/zod/schemas/member.schema";
import { Profile } from "@conquest/zod/schemas/profile.schema";
import { skipToken } from "@tanstack/react-query";
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
  const utils = trpc.useUtils();

  const { data: profiles } = trpc.profiles.members.useQuery(
    members.length > 0 ? { members } : skipToken,
  );

  const { mutate: mergeMembers } = trpc.duplicate.merge.useMutation({
    onSuccess: (data) => {
      const { id } = data ?? {};

      if (id) {
        onCancel();
        utils.profiles.list.invalidate({ member_id: id });
        utils.members.invalidate();
        setLoading(false);
      }
    },
  });

  const onMerge = async () => {
    setLoading(true);
    mergeMembers({ members, finalMember });
  };

  const onCancel = () => {
    setOpen(false);
    onReset();
  };

  useEffect(() => {
    setFinalMember(getFinalMember({ members }));
  }, [members]);

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

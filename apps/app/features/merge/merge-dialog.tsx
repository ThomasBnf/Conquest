import { useUser } from "@/context/userContext";
import { trpc } from "@/server/client";
import { Button } from "@conquest/ui/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@conquest/ui/dialog";
import { Separator } from "@conquest/ui/separator";
import type { Member } from "@conquest/zod/schemas/member.schema";
import { ArrowLeftRight, Equal } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { MemberCard } from "./member-card";
import { MemberPicker } from "./member-picker";

type Props = {
  open: boolean;
  setOpen: (open: boolean) => void;
  member: Member;
};

export const MergeDialog = ({ open, setOpen, member }: Props) => {
  const { slug } = useUser();
  const { first_name, last_name } = member ?? {};
  const [leftMember, setLeftMember] = useState<Member | null>(null);
  const [rightMember, setRightMember] = useState(member);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const utils = trpc.useUtils();

  const { mutateAsync: mergeMembers } = trpc.members.mergeMembers.useMutation({
    onSuccess: () => {
      utils.members.list.invalidate();
      toast.success("Members merged");
      onCancel();
    },
  });

  const onSelectLeftMember = (member: Member) => setLeftMember(member);

  const onSwitchMembers = () => {
    if (!leftMember) return;
    if (!rightMember) return;

    setLeftMember(rightMember);
    setRightMember(leftMember);
  };

  const onCancel = () => {
    setLeftMember(null);
    setRightMember(member);
    setOpen(false);
  };

  const onMerge = async () => {
    if (!leftMember) return;
    if (!rightMember) return;

    setLoading(true);
    await mergeMembers({ leftMember, rightMember });
    router.replace(`/${slug}/members/${rightMember.id}/analytics`);
  };

  return (
    <Dialog open={open} onOpenChange={() => onCancel()}>
      <DialogContent className="max-w-[95vw]">
        <DialogHeader>
          <DialogTitle>
            Merge {first_name} {last_name}
          </DialogTitle>
        </DialogHeader>
        <DialogBody>
          <div className="flex items-stretch">
            <div className="flex w-[calc(67%-24px)] items-stretch">
              {leftMember ? (
                <MemberCard member={leftMember} />
              ) : (
                <div className="flex aspect-square w-[calc(50%-24px)] flex-col items-center justify-center divide-y rounded-md border">
                  <MemberPicker
                    currentMember={member}
                    onSelect={onSelectLeftMember}
                  />
                </div>
              )}
              <div className="flex w-12 items-center">
                <Separator className="flex-1" />
                <Button
                  variant={leftMember ? "default" : "outline"}
                  disabled={!leftMember}
                  onClick={onSwitchMembers}
                >
                  <ArrowLeftRight size={16} />
                </Button>
                <Separator className="flex-1" />
              </div>
              <MemberCard member={rightMember} />
            </div>
            <div className="flex w-12 items-center">
              <Separator className="flex-1" />
              <div className="flex size-6 shrink-0 items-center justify-center rounded-md border">
                <Equal size={16} className="text-muted-foreground" />
              </div>
              <Separator className="flex-1" />
            </div>
            <MemberCard
              member={rightMember}
              leftMember={leftMember}
              className="w-[calc(33%-24px)]"
            />
          </div>
          <div className="flex flex-col gap-1 rounded-md border bg-muted p-4">
            <p className="font-medium text-base">Merge Rules</p>
            <p>
              1. We use the right profile attributes as reference{" "}
              {"(e.g: name, email, job title, etc...)"}
            </p>
            <p>
              2. We use the date of the first activity as the reference for the
              source and creation date attributes.
            </p>
            <p>
              3. The following attributes will be combined:{" "}
              {"(e.g: tags, emails, phone numbers, activities)"}
            </p>
            <p className="actions-primary mt-2 w-fit rounded bg-foreground px-2 py-1 font-medium text-white">
              ⚠️ This action cannot be undone.
            </p>
          </div>
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            loading={loading}
            disabled={loading || !leftMember}
            onClick={onMerge}
          >
            Merge
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

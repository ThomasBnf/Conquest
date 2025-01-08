import { mergeMember } from "@/actions/members/mergeMember";
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
import type { MemberWithCompany } from "@conquest/zod/schemas/member.schema";
import { AlertTriangle, ArrowLeftRight, Equal } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { MemberCard } from "./member-card";
import { MemberPicker } from "./member-picker";
type Props = {
  open: boolean;
  setOpen: (open: boolean) => void;
  member: MemberWithCompany;
};

export const MergeDialog = ({ open, setOpen, member }: Props) => {
  const { first_name, last_name } = member;
  const [leftMember, setLeftMember] = useState<MemberWithCompany | null>(null);
  const [rightMember, setRightMember] = useState<MemberWithCompany>(member);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onSelectLeftMember = (member: MemberWithCompany) => {
    setLeftMember(member);
  };

  const onSwitchMembers = () => {
    if (!leftMember) return;

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

    setLoading(true);

    const response = await mergeMember({ leftMember, rightMember });
    const error = response?.serverError;

    if (error) {
      setLoading(false);
      return toast.error(error);
    }

    router.refresh();
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
                  <ArrowLeftRight size={15} />
                </Button>
                <Separator className="flex-1" />
              </div>
              <MemberCard member={rightMember} />
            </div>
            <div className="flex w-12 items-center">
              <Separator className="flex-1" />
              <div className="flex size-6 shrink-0 items-center justify-center rounded-md border">
                <Equal size={15} className="text-muted-foreground" />
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
              1. Most attributes will use values from the newer record{" "}
              {"(e.g: first name, job title, etc...)"}
            </p>
            <p>
              2. Source and created date will be preserved from the older record
            </p>
            <p>
              3. The following will be combined:{" "}
              {"(e.g: tags, emails, phone numbers, activities)"}
            </p>
            <div className="mt-2 flex items-center gap-2">
              <AlertTriangle size={18} className="text-orange-500" />
              <p className="font-medium">This action cannot be undone.</p>
            </div>
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

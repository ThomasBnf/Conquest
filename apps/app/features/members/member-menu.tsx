"use client";

import { deleteMember } from "@/actions/members/deleteMember";
import { AlertDialog } from "@/components/custom/alert-dialog";
import { MergeDialog } from "@/features/merge/merge-dialog";
import { Button } from "@conquest/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@conquest/ui/dropdown-menu";
import type { MemberWithCompany } from "@conquest/zod/schemas/member.schema";
import { Copy, Merge, MoreHorizontal, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type Props = {
  member: MemberWithCompany;
};

export const MemberMenu = ({ member }: Props) => {
  const [open, setOpen] = useState(false);
  const [mergeOpen, setMergeOpen] = useState(false);

  const onCopy = () => {
    navigator.clipboard.writeText(member.id);
    toast.success("Member ID copied to clipboard");
  };

  const onDelete = async () => {
    const rMember = await deleteMember({ id: member.id });
    const error = rMember?.serverError;

    if (error) return toast.error(error);
    return toast.success("Member deleted");
  };

  return (
    <>
      <AlertDialog
        title="Delete member"
        description="Are you sure you want to delete this member?"
        onConfirm={onDelete}
        open={open}
        setOpen={setOpen}
      />
      <MergeDialog open={mergeOpen} setOpen={setMergeOpen} member={member} />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon_sm">
            <MoreHorizontal size={16} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setMergeOpen(true)}>
            <Merge size={16} />
            Merge
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onCopy}>
            <Copy size={16} />
            Copy ID
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setOpen(true)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 size={16} />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

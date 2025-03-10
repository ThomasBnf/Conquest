"use client";

import { AlertDialog } from "@/components/custom/alert-dialog";
import { MergeDialog } from "@/features/merge/merge-dialog";
import { trpc } from "@/server/client";
import { Button } from "@conquest/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@conquest/ui/dropdown-menu";
import type { Member } from "@conquest/zod/schemas/member.schema";
import { Copy, Merge, MoreHorizontal, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type Props = {
  member: Member;
};

export const MenuMember = ({ member }: Props) => {
  const [open, setOpen] = useState(false);
  const [mergeOpen, setMergeOpen] = useState(false);
  const utils = trpc.useUtils();

  const onCopy = () => {
    navigator.clipboard.writeText(member.id);
    toast.success("Member ID copied to clipboard");
  };

  const { mutateAsync: deleteMember } = trpc.members.delete.useMutation({
    onSuccess: () => {
      utils.members.list.invalidate();
      toast.success("Member deleted");
    },
  });

  const onDelete = async () => {
    await deleteMember({ id: member.id });
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
          <Button variant="outline" size="icon">
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

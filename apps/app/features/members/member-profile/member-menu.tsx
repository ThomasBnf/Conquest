"use client";

import { AlertDialog } from "@/components/custom/alert-dialog";
import { deleteMemberAction } from "@/features/members/actions/deleteMemberAction";
import { Button } from "@conquest/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@conquest/ui/dropdown-menu";
import type { MemberWithActivities } from "@conquest/zod/activity.schema";
import { Copy, MoreHorizontal, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type Props = {
  member: MemberWithActivities;
};

export const MemberMenu = ({ member }: Props) => {
  const [open, setOpen] = useState(false);

  const onCopy = () => {
    navigator.clipboard.writeText(member.id);
    toast.success("Member ID copied to clipboard");
  };

  const onDelete = async () => {
    const rMember = await deleteMemberAction({ id: member.id });
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
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal size={16} className="text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onCopy}>
            <Copy size={16} />
            Copy member ID
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setOpen(true)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 size={16} />
            Delete member
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

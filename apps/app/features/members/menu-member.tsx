"use client";

import { AlertDialog } from "@/components/custom/alert-dialog";
import { Button } from "@conquest/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@conquest/ui/dropdown-menu";
import type { Member } from "@conquest/zod/schemas/member.schema";
import {
  Copy,
  MoreHorizontal,
  Trash2,
  UserMinus,
  UserPlus,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useDeleteMember } from "./mutations/useDeleteMember";
import { useUpdateMember } from "./mutations/useUpdateMember";

type Props = {
  member: Member;
};

export const MenuMember = ({ member }: Props) => {
  const { isStaff } = member;
  const [open, setOpen] = useState(false);

  const updateMember = useUpdateMember();
  const deleteMember = useDeleteMember();

  const onCopy = () => {
    navigator.clipboard.writeText(member.id);
    toast.success("Member ID copied to clipboard");
  };

  const onDelete = async () => {
    await deleteMember({ id: member.id });
    toast.success("Member deleted");
  };

  const onMarkAsStaff = async () => {
    await updateMember({ ...member, isStaff: !isStaff });
    toast.success(`${isStaff ? "Removed from staff" : "Marked as staff"}`);
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
          <Button variant="outline" size="icon">
            <MoreHorizontal size={16} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onMarkAsStaff}>
            {member.isStaff ? <UserMinus size={16} /> : <UserPlus size={16} />}
            <span>
              {member.isStaff ? "Remove from staff" : "Mark as staff"}
            </span>
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

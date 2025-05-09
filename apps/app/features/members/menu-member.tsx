"use client";

import { AlertDialog } from "@/components/custom/alert-dialog";
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
import {
  Copy,
  MoreHorizontal,
  Trash2,
  UserMinus,
  UserPlus,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type Props = {
  member: Member;
};

export const MenuMember = ({ member }: Props) => {
  const { id, firstName, isStaff } = member;
  const [open, setOpen] = useState(false);
  const utils = trpc.useUtils();

  const onCopy = () => {
    navigator.clipboard.writeText(member.id);
    toast.success("Member ID copied to clipboard");
  };

  const { mutateAsync: updateMember } = trpc.members.update.useMutation({
    onMutate: (updatedMember) => {
      const { id } = updatedMember;

      utils.members.get.cancel({ id });
      const previousMember = utils.members.get.getData({ id });

      utils.members.get.setData({ id }, updatedMember);

      return { previousMember };
    },
    onError: (_, __, context) => {
      utils.members.get.setData({ id }, context?.previousMember);
    },
    onSettled: () => {
      utils.members.get.invalidate({ id });
      utils.members.invalidate();
    },
    onSuccess: () => {
      toast.success(
        `${firstName} ${isStaff ? "marked as staff" : "removed from staff"}`,
      );
    },
  });

  const { mutateAsync: deleteMember } = trpc.members.delete.useMutation({
    onSuccess: () => {
      utils.members.get.invalidate();
      utils.members.list.invalidate();
      toast.success("Member deleted");
    },
  });

  const onDelete = async () => {
    await deleteMember({ id: member.id });
  };

  const onMarkAsStaff = async () => {
    await updateMember({ ...member, isStaff: !isStaff });
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

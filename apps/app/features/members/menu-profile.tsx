"use client";

import { AlertDialog } from "@/components/custom/alert-dialog";
import { trpc } from "@/server/client";
import { Button, buttonVariants } from "@conquest/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@conquest/ui/dropdown-menu";
import type { Profile } from "@conquest/zod/schemas/profile.schema";
import { ExternalLink, MoreHorizontal, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

type Props = {
  href?: string;
  profile: Profile;
};

export const MenuProfile = ({ href, profile }: Props) => {
  const [open, setOpen] = useState(false);
  const utils = trpc.useUtils();

  const { mutateAsync: deleteProfile } = trpc.profiles.delete.useMutation({
    onSuccess: () => {
      utils.profiles.list.invalidate();
      toast.success("Profile deleted");
    },
  });

  const onDelete = async () => {
    await deleteProfile({ id: profile.id });
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
      <div className="ml-auto flex items-center gap-1 opacity-0 group-hover:opacity-100">
        <Link
          href={href ?? ""}
          target="_blank"
          className={buttonVariants({
            variant: "outline",
            size: "icon_sm",
          })}
        >
          <ExternalLink size={16} />
        </Link>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon_sm">
              <MoreHorizontal size={16} className="text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => setOpen(true)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 size={16} />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );
};

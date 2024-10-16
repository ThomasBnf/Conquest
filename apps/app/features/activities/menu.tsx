"use client";

import { deleteActivity } from "@/actions/activities/deleteActivity";
import { AlertDialog } from "@/components/custom/alert-dialog";
import { Button } from "@conquest/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@conquest/ui/dropdown-menu";
import type { Activity } from "@conquest/zod/activity.schema";
import { MoreHorizontal, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type Props = {
  activity: Activity;
};

export const Menu = ({ activity }: Props) => {
  const [open, setOpen] = useState(false);

  const onDelete = async () => {
    const rActivity = await deleteActivity({ id: activity.id });
    const error = rActivity?.serverError;

    if (error) return toast.error(error);
    return toast.success("Activity deleted");
  };

  return (
    <>
      <AlertDialog
        title="Are you sure you want to delete this activity?"
        description="This action cannot be undone."
        onConfirm={onDelete}
        open={open}
        setOpen={setOpen}
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4"
          >
            <MoreHorizontal size={16} className="text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
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

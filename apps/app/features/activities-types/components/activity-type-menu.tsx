"use client";

import { AlertDialog } from "@/components/custom/alert-dialog";
import { Button } from "@conquest/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@conquest/ui/dropdown-menu";
import type { ActivityType } from "@conquest/zod/activity-type.schema";
import { Edit2, MoreHorizontal, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { deleteActivityType } from "../actions/deleteActivityType";

type Props = {
  activityType: ActivityType;
};

export const ActivityTypeMenu = ({ activityType }: Props) => {
  const [open, setOpen] = useState(false);

  const onConfirm = async () => {
    const rData = await deleteActivityType({ id: activityType.id });
    const error = rData?.serverError;

    if (error) {
      return toast.error(error);
    }

    toast.success("Activity type deleted");
    setOpen(false);
  };

  return (
    <>
      <AlertDialog
        title="Delete activity type"
        description="Are you sure you want to delete this activity type?"
        onConfirm={onConfirm}
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
          <DropdownMenuItem>
            <Edit2 size={16} />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={() => setOpen(true)}
          >
            <Trash2 size={16} />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

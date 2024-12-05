"use client";

import { deleteActivityType } from "@/actions/activity-types/deleteActivityType";
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
import { EditActivityType } from "./edit-activity.type";

type Props = {
  activityType: ActivityType;
};

export const ActivityTypeMenu = ({ activityType }: Props) => {
  const [open, setOpen] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);

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
      <EditActivityType
        open={openEdit}
        setOpen={setOpenEdit}
        activityType={activityType}
      />
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
          <DropdownMenuItem onClick={() => setOpenEdit(true)}>
            <Edit2 size={16} />
            Edit
          </DropdownMenuItem>
          {activityType.deletable && (
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => setOpen(true)}
            >
              <Trash2 size={16} />
              Delete
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

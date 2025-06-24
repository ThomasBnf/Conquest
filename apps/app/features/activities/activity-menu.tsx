"use client";

import { AlertDialog } from "@/components/custom/alert-dialog";
import { trpc } from "@/server/client";
import { Button } from "@conquest/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@conquest/ui/dropdown-menu";
import type { ActivityWithType } from "@conquest/zod/schemas/activity.schema";
import { MoreHorizontal, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ActivityLink } from "./activity-link";

type Props = {
  activity: ActivityWithType;
  href?: string | null | undefined;
};

export const ActivityMenu = ({ activity, href }: Props) => {
  const [open, setOpen] = useState(false);

  const utils = trpc.useUtils();

  const { mutateAsync } = trpc.activities.delete.useMutation({
    onSuccess: () => {
      utils.dashboard.heatmap.invalidate({ memberId: activity.memberId });
      utils.members.get.invalidate({ id: activity.memberId });
      utils.activities.listInfinite.invalidate();
      toast.success("Activity deleted");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const onDelete = async () => {
    await mutateAsync({ id: activity.id });
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
      <div className="flex items-center gap-2">
        <ActivityLink activity={activity} href={href} />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <MoreHorizontal size={16} />
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
      </div>
    </>
  );
};

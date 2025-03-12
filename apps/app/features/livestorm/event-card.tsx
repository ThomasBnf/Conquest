import { AlertDialog } from "@/components/custom/alert-dialog";
import { trpc } from "@/server/client";
import { Badge } from "@conquest/ui/badge";
import { Button } from "@conquest/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@conquest/ui/dropdown-menu";
import type { Event } from "@conquest/zod/schemas/event.schema";
import { format } from "date-fns";
import { MoreHorizontal, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type Props = {
  event: Event;
};

export const EventCard = ({ event }: Props) => {
  const [open, setOpen] = useState(false);
  const { id, title, started_at } = event;
  const today = new Date();

  const { mutateAsync } = trpc.events.delete.useMutation({
    onSuccess: () => {
      toast.success("Event deleted");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const onDelete = async () => {
    await mutateAsync({ id });
  };

  return (
    <>
      <AlertDialog
        title="Delete event"
        description="Are you sure you want to delete this event?"
        onConfirm={onDelete}
        open={open}
        setOpen={setOpen}
      />
      <div key={id} className="flex items-start justify-between pt-2">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <p className="font-medium">{title}</p>
            {started_at > today && <Badge variant="info">Upcoming</Badge>}
          </div>
          <p className="text-muted-foreground">
            {format(started_at, "PP, HH'h'mm")}
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <MoreHorizontal size={16} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => setOpen(true)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 size={16} />
              <p>Delete</p>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );
};

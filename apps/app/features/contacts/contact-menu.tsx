"use client";

import { deleteContact } from "@/actions/contacts/deleteContact";
import { AlertDialog } from "@/components/custom/alert-dialog";
import { Button } from "@conquest/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@conquest/ui/dropdown-menu";
import type { ContactWithActivities } from "@conquest/zod/activity.schema";
import { Copy, MoreVertical, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type Props = {
  contact: ContactWithActivities;
};

export const ContactMenu = ({ contact }: Props) => {
  const [open, setOpen] = useState(false);

  const onCopy = () => {
    navigator.clipboard.writeText(contact.id);
    toast.success("Contact ID copied to clipboard");
  };

  const onDelete = async () => {
    const rContact = await deleteContact({ id: contact.id });
    const error = rContact?.serverError;

    if (error) return toast.error(error);
    return toast.success("Contact deleted");
  };

  return (
    <>
      <AlertDialog
        title="Delete contact"
        description="Are you sure you want to delete this contact?"
        onConfirm={onDelete}
        open={open}
        setOpen={setOpen}
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreVertical size={16} className="text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onCopy}>
            <Copy size={16} />
            Copy contact ID
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setOpen(true)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 size={16} />
            Delete contact
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

import { Button } from "@conquest/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@conquest/ui/dropdown-menu";
import type { Tag } from "@conquest/zod/schemas/tag.schema";
import { AlertDialog } from "components/custom/alert-dialog";
import { Edit2, MoreHorizontal, Trash2 } from "lucide-react";
import { useState } from "react";
import { useDeleteTag } from "./mutations/useDeleteTag";

type Props = {
  tag: Tag;
  setIsEditing: (value: boolean) => void;
};

export const TagMenu = ({ tag, setIsEditing }: Props) => {
  const [open, setOpen] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const deleteTag = useDeleteTag();

  const onDeleteTag = async () => {
    await deleteTag({ id: tag.id });
  };

  return (
    <>
      {showAlert && (
        <AlertDialog
          title={`Delete the tag "${tag.name}"?`}
          description="This action cannot be undone."
          onConfirm={onDeleteTag}
          open={showAlert}
          setOpen={setShowAlert}
        />
      )}
      <DropdownMenu open={open} onOpenChange={setOpen} modal>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon">
            <MoreHorizontal size={16} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setIsEditing(true)}>
            <Edit2 size={16} />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setShowAlert(true)}
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

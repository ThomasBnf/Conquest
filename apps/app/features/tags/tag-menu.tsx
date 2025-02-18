import { trpc } from "@/server/client";
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

type Props = {
  tag: Tag;
  setIsEditing: (value: boolean) => void;
};

export const TagMenu = ({ tag, setIsEditing }: Props) => {
  const [open, setOpen] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const utils = trpc.useUtils();

  const { mutateAsync } = trpc.tags.deleteTag.useMutation({
    async onMutate(newTag) {
      setIsEditing(false);
      await utils.tags.getAllTags.cancel();

      const prevData = utils.tags.getAllTags.getData();

      utils.tags.getAllTags.setData(undefined, (old) =>
        old?.filter((tag) => tag.id !== newTag.id),
      );

      return { prevData };
    },
    onError: (_err, _newTag, context) => {
      utils.tags.getAllTags.setData(undefined, context?.prevData);
    },
    onSettled: () => {
      utils.tags.getAllTags.invalidate();
    },
  });

  const onDeleteTag = async () => {
    await mutateAsync({ id: tag.id });
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

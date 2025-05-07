import { AlertDialog } from "@/components/custom/alert-dialog";
import { COLORS } from "@/constant";
import { trpc } from "@/server/client";
import { Button } from "@conquest/ui/button";
import { cn } from "@conquest/ui/cn";
import { Input } from "@conquest/ui/input";
import { Label } from "@conquest/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@conquest/ui/popover";
import { ScrollArea } from "@conquest/ui/scroll-area";
import { Separator } from "@conquest/ui/separator";
import { Tag } from "@conquest/zod/schemas/tag.schema";
import { Check, Ellipsis, Trash } from "lucide-react";
import { useState } from "react";

type Props = {
  tag: Tag;
  onUpdate: (tags: string[]) => void;
  className?: string;
};

export const TagMenuDialog = ({ tag, onUpdate, className }: Props) => {
  const [open, setOpen] = useState(false);
  const [openAlert, setOpenAlert] = useState(false);
  const [name, setName] = useState(tag.name);

  const utils = trpc.useUtils();

  const { mutateAsync: deleteTag } = trpc.tags.delete.useMutation({
    onMutate: async () => {
      await utils.tags.list.cancel();

      const previousTags = utils.tags.list.getData();

      const newTags = (previousTags ?? []).filter((t) => t.id !== tag.id);

      utils.tags.list.setData(undefined, newTags);

      onUpdate(newTags.map((t) => t.id));

      return { previousTags };
    },
    onError: (_, __, context) => {
      console.log(_);
      utils.tags.list.setData(undefined, context?.previousTags ?? []);
    },
    onSuccess: () => {
      utils.tags.list.invalidate();
    },
  });

  const { mutateAsync: updateTag } = trpc.tags.update.useMutation({
    onMutate: ({ name, color }) => {
      utils.tags.list.cancel();

      const previousTags = utils.tags.list.getData();

      utils.tags.list.setData(undefined, (old) => {
        return old?.map((t) =>
          t.id === tag.id
            ? { ...t, name: name ?? t.name, color: color ?? t.color }
            : t,
        );
      });

      return { previousTags };
    },
    onError: (error, variables, context) => {
      if (context) {
        utils.tags.list.setData(undefined, context.previousTags);
      }
    },
    onSettled: () => {
      utils.tags.list.invalidate();
    },
  });

  const onDelete = async (e?: React.MouseEvent) => {
    await deleteTag({ id: tag.id });
  };

  return (
    <>
      <AlertDialog
        title="Delete tag"
        description="Are you sure you want to delete this tag?"
        open={openAlert}
        setOpen={setOpenAlert}
        onConfirm={onDelete}
      />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild className={cn("ml-auto", className)}>
          <Button variant="outline" size="icon_sm">
            <Ellipsis className="size-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          onOpenAutoFocus={(e) => e.preventDefault()}
          align="start"
          className="w-64 p-0"
        >
          <div className="space-y-2 p-2">
            <Input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => updateTag({ id: tag.id, name })}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  updateTag({ id: tag.id, name });
                }
              }}
            />
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={(e) => {
                e.stopPropagation();
                setOpenAlert(true);
              }}
            >
              <Trash size={16} />
              Delete
            </Button>
          </div>
          <Separator />
          <div className="px-1 pt-2">
            <Label className="pl-2 text-muted-foreground text-xs">Colors</Label>
            <ScrollArea>
              {COLORS.map((color) => (
                <Button
                  key={color.hex}
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => updateTag({ id: tag.id, color: color.hex })}
                >
                  <div
                    className="rounded-md"
                    style={{
                      width: "18px",
                      height: "18px",
                      backgroundColor: color.hex,
                    }}
                  />
                  <p>{color.name}</p>
                  {tag.color === color.hex && (
                    <Check size={15} className="ml-auto" />
                  )}
                </Button>
              ))}
            </ScrollArea>
          </div>
        </PopoverContent>
      </Popover>
    </>
  );
};

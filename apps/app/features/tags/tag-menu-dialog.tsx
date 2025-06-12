import { AlertDialog } from "@/components/custom/alert-dialog";
import { COLORS } from "@/constant";
import { Button } from "@conquest/ui/button";
import { Input } from "@conquest/ui/input";
import { Label } from "@conquest/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@conquest/ui/popover";
import { Separator } from "@conquest/ui/separator";
import { Tag } from "@conquest/zod/schemas/tag.schema";
import { Check, Ellipsis, Trash } from "lucide-react";
import { useState } from "react";
import { useDeleteTag } from "./mutations/useDeleteTag";
import { useUpdateTag } from "./mutations/useUpdateTag";

type Props = {
  tag: Tag;
};

export const TagMenuDialog = ({ tag }: Props) => {
  const [open, setOpen] = useState(false);
  const [openAlert, setOpenAlert] = useState(false);

  const updateTag = useUpdateTag({ tag });
  const deleteTag = useDeleteTag();

  const onDelete = async () => {
    await deleteTag({ id: tag.id });
  };

  const onBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    updateTag({ id: tag.id, name: e.target.value });
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      updateTag({ id: tag.id, name: e.currentTarget.value });
    }
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
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="icon_sm"
            className="ml-auto opacity-0 duration-0 group-hover:opacity-100"
          >
            <Ellipsis size={16} />
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
              defaultValue={tag.name}
              onBlur={onBlur}
              onKeyDown={onKeyDown}
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
          <div className="space-y-1 p-2">
            <Label className="text-muted-foreground text-xs">Colors</Label>
            <div>
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
                    <Check size={16} className="ml-auto" />
                  )}
                </Button>
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </>
  );
};

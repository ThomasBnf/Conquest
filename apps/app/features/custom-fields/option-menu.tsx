import { AlertDialog } from "@/components/custom/alert-dialog";
import { Button } from "@conquest/ui/button";
import { cn } from "@conquest/ui/cn";
import { Input } from "@conquest/ui/input";
import { Label } from "@conquest/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@conquest/ui/popover";
import { Separator } from "@conquest/ui/separator";
import { TAILWIND_COLORS } from "@conquest/utils/getRandomColor";
import { CustomField, Option } from "@conquest/zod/schemas/custom-field.schema";
import { Check, Ellipsis, Trash } from "lucide-react";
import { useState } from "react";
import { useUpdateField } from "./mutations/useUpdateField";

export const OptionMenu = ({
  field,
  option,
}: {
  field: CustomField;
  option: Option;
}) => {
  const [open, setOpen] = useState(false);
  const [openAlert, setOpenAlert] = useState(false);
  const updateField = useUpdateField();

  const onUpdateLabel = (label: string) => {
    updateField({
      ...field,
      options: field.options?.map((o) =>
        o.id === option.id ? { ...o, label } : o,
      ),
    });
  };

  const onUpdateColor = (color: string) => {
    updateField({
      ...field,
      options: field.options?.map((o) =>
        o.id === option.id ? { ...o, color } : o,
      ),
    });
  };

  const onDelete = async () => {
    updateField({
      ...field,
      options: field.options?.filter((o) => o.id !== option.id),
    });
  };

  return (
    <>
      <AlertDialog
        title="Delete option"
        description="Are you sure you want to delete this option? This action cannot be undone."
        onConfirm={() => onDelete()}
        open={openAlert}
        setOpen={setOpenAlert}
      />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="icon_sm" className="ml-auto">
            <Ellipsis size={14} />
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
              defaultValue={option.label}
              onBlur={(e) => onUpdateLabel(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") onUpdateLabel(e.currentTarget.value);
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
          <div className="space-y-1 p-2">
            <Label className="text-muted-foreground text-xs">Colors</Label>
            <div>
              {TAILWIND_COLORS.map((color) => (
                <Button
                  key={color}
                  variant="ghost"
                  className="w-full justify-start capitalize"
                  onClick={() => onUpdateColor(color)}
                >
                  <div
                    className={cn("rounded-md", `bg-${color}-100`)}
                    style={{
                      width: "18px",
                      height: "18px",
                    }}
                  />
                  <p>{color}</p>
                  {option.color === color && (
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

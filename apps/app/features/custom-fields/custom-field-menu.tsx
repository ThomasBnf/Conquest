import { AlertDialog } from "@/components/custom/alert-dialog";
import { Button } from "@conquest/ui/button";
import { Input } from "@conquest/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@conquest/ui/popover";
import { CustomField } from "@conquest/zod/schemas/custom-field.schema";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { useDeleteField } from "./mutations/useDeleteField";
import { useUpdateField } from "./mutations/useUpdateField";

type Props = {
  field: CustomField;
};

export const CustomFieldMenu = ({ field }: Props) => {
  const { label } = field;
  const [open, setOpen] = useState(false);
  const [openAlert, setOpenAlert] = useState(false);

  const updateField = useUpdateField();
  const deleteField = useDeleteField({ record: field.record });

  const onUpdateLabel = (label: string) => {
    updateField({ ...field, label });
  };

  const onDelete = async () => {
    deleteField(field);
  };

  return (
    <>
      <AlertDialog
        title="Delete custom field for all members"
        description="Are you sure you want to delete this custom field for all members?"
        onConfirm={onDelete}
        open={openAlert}
        setOpen={setOpenAlert}
      />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild className="-ml-[6px]">
          <Button
            variant="ghost"
            size="xs"
            className="w-fit justify-start text-muted-foreground text-xs"
          >
            {label}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="space-y-2">
          <Input
            defaultValue={label}
            onBlur={(e) => onUpdateLabel(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                onUpdateLabel(e.currentTarget.value);
                setOpen(false);
              }
            }}
          />
          <Button
            variant="ghost"
            onClick={() => setOpenAlert(true)}
            className="w-full justify-start"
          >
            <Trash2 size={16} />
            Delete
          </Button>
        </PopoverContent>
      </Popover>
    </>
  );
};

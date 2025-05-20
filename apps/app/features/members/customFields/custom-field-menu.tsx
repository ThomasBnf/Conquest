import { AlertDialog } from "@/components/custom/alert-dialog";
import { useUpdateWorkspace } from "@/features/workspaces/mutations/useUpdateWorkspace";
import { trpc } from "@/server/client";
import { Button } from "@conquest/ui/button";
import { Input } from "@conquest/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@conquest/ui/popover";
import { CustomField } from "@conquest/zod/schemas/custom-fields.schema";
import { Workspace } from "@conquest/zod/schemas/workspace.schema";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type Props = {
  field: CustomField;
  workspace: Workspace;
};

export const CustomFieldMenu = ({ field, workspace }: Props) => {
  const { customFields } = workspace;
  const [open, setOpen] = useState(false);
  const [openAlert, setOpenAlert] = useState(false);
  const [label, setLabel] = useState(field.label);

  const updateWorkspace = useUpdateWorkspace();
  const { mutateAsync } = trpc.workspaces.deleteField.useMutation();

  const updateFieldLabel = (field: CustomField, label: string) => {
    if (label === "") {
      setLabel(field.label);
      return;
    }

    updateWorkspace({
      ...workspace,
      customFields: customFields.map((f) =>
        f.id === field.id ? { ...f, label } : f,
      ),
    });

    setOpen(false);
  };

  const deleteField = async () => {
    await updateWorkspace({
      ...workspace,
      customFields: customFields.filter((f) => f.id !== field.id),
    });

    await mutateAsync({ id: field.id });

    toast.success("Custom field deleted");
  };

  return (
    <>
      <AlertDialog
        title="Delete custom field for all members"
        description="Are you sure you want to delete this custom field for all members?"
        onConfirm={deleteField}
        open={openAlert}
        setOpen={setOpenAlert}
      />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
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
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            onBlur={(e) => updateFieldLabel(field, e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                updateFieldLabel(field, label);
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

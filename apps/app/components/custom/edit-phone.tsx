import { Button, buttonVariants } from "@conquest/ui/button";
import { cn } from "../../../../packages/ui/src/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@conquest/ui/dropdown-menu";
import { Member } from "@conquest/zod/schemas/member.schema";
import { Ellipsis } from "lucide-react";
import { KeyboardEvent as ReactKeyboardEvent, useState } from "react";
import { toast } from "sonner";
import { PhoneInput } from "./phone-input";

type Props = {
  member: Member;
  phone: string;
  onUpdate: (field: keyof Member, value: string | string[]) => void;
};

export const EditPhone = ({ member, phone, onUpdate }: Props) => {
  const [value, setValue] = useState(phone);
  const [editing, setEditing] = useState(false);
  const [open, setOpen] = useState("");

  const onConfirm = () => {
    const formattedPhone = value.trim().toLowerCase();

    if (member.phones.includes(formattedPhone) && formattedPhone !== phone) {
      return toast.error("This phone already exists");
    }

    const updatedPhones = member.phones.map((p) =>
      p === phone ? formattedPhone : p,
    );

    onUpdate("phones", updatedPhones);
    setEditing(false);
  };

  const onDelete = (phoneToDelete: string) => {
    const updatedPhones = member.phones.filter((p) => p !== phoneToDelete);
    onUpdate("phones", updatedPhones);
  };

  const onBlur = () => {
    if (editing && value !== phone) {
      onConfirm();
    }
    setEditing(false);
  };

  const onKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      onConfirm();
    } else if (event.key === "Escape") {
      setValue(phone);
      setEditing(false);
    }
  };

  if (!editing) {
    return (
      <div
        className={cn(
          buttonVariants({ variant: "ghost" }),
          "group w-full justify-between pr-1",
        )}
      >
        <p className="truncate border border-transparent">{value}</p>
        <div className="flex items-center gap-1">
          <DropdownMenu
            open={open === value}
            onOpenChange={(isOpen) => setOpen(isOpen ? value : "")}
          >
            <DropdownMenuTrigger
              asChild
              className={cn(
                "transition-opacity",
                open === value
                  ? "opacity-100"
                  : "opacity-0 group-hover:opacity-100",
              )}
            >
              <Button variant="outline" size="icon_sm">
                <Ellipsis size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setEditing(true)}>
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(phone)}>
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    );
  }

  return (
    <PhoneInput
      autoFocus
      value={value}
      onChange={(event) => setValue(event)}
      onBlur={onBlur}
      onFocus={(event) => (event.target as HTMLInputElement).select()}
      onKeyDown={onKeyDown}
    />
  );
};

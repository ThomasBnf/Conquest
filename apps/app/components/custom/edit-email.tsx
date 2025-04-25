import { Button, buttonVariants } from "@conquest/ui/button";
import { cn } from "@conquest/ui/cn";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@conquest/ui/dropdown-menu";
import { Input } from "@conquest/ui/input";
import { Member } from "@conquest/zod/schemas/member.schema";
import { Ellipsis, Star } from "lucide-react";
import { KeyboardEvent as ReactKeyboardEvent, useState } from "react";
import { toast } from "sonner";

type Props = {
  member: Member;
  email: string;
  onUpdate: (field: keyof Member, value: string | string[]) => void;
};

export const EditEmail = ({ member, email, onUpdate }: Props) => {
  const { primaryEmail } = member;

  const [value, setValue] = useState(email);
  const [editing, setEditing] = useState(false);
  const [open, setOpen] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const onConfirm = () => {
    if (!validateEmail(value)) {
      return toast.error("Invalid email format");
    }

    const formattedEmail = value.trim().toLowerCase();

    if (member.emails.includes(formattedEmail) && formattedEmail !== email) {
      return toast.error("This email already exists");
    }

    const updatedEmails = member.emails.map((e) =>
      e === email ? formattedEmail : e,
    );

    onUpdate("emails", updatedEmails);
    setEditing(false);
  };

  const onDelete = (emailToDelete: string) => {
    const updatedEmails = member.emails.filter((e) => e !== emailToDelete);
    onUpdate("emails", updatedEmails);
  };

  const onBlur = () => {
    if (editing && value !== email) {
      onConfirm();
    }
    setEditing(false);
  };

  const onKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      onConfirm();
    } else if (event.key === "Escape") {
      setValue(email);
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
          {primaryEmail === email && (
            <Button
              variant="ghost"
              size="icon_sm"
              onClick={() => onUpdate("primaryEmail", email)}
            >
              <Star size={16} className="text-yellow-500" />
            </Button>
          )}
          <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger
              asChild
              className={cn(
                "transition-opacity",
                open ? "opacity-100" : "opacity-0 group-hover:opacity-100",
              )}
            >
              <Button variant="outline" size="icon_sm">
                <Ellipsis size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {primaryEmail !== email && (
                <DropdownMenuItem
                  onClick={() => onUpdate("primaryEmail", email)}
                >
                  Mark as primary
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => setEditing(true)}>
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(email)}>
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    );
  }

  return (
    <Input
      autoFocus
      placeholder="Add email"
      className="h-8"
      value={value}
      onChange={(event) => setValue(event.target.value)}
      onBlur={onBlur}
      onFocus={(event) => event.target.select()}
      onKeyDown={onKeyDown}
    />
  );
};

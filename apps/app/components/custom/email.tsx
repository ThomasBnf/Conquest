import { Input } from "@conquest/ui/input";
import { Member } from "@conquest/zod/schemas/member.schema";
import { KeyboardEvent as ReactKeyboardEvent, useState } from "react";
import { toast } from "sonner";

type Props = {
  member: Member;
  onUpdate: (field: keyof Member, value: string | string[]) => void;
  onCancel: () => void;
};

export const Email = ({ member, onUpdate, onCancel }: Props) => {
  const [email, setEmail] = useState("");

  const onConfirm = () => {
    if (!email.trim()) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return toast.error("Invalid email format");

    const formattedEmail = email.trim().toLowerCase();

    const updatedEmails = [...member.emails, formattedEmail];
    onUpdate("emails", updatedEmails);

    if (member.emails.length === 0) {
      onUpdate("primaryEmail", formattedEmail);
    }

    setEmail("");
  };

  const onBlur = () => {
    onCancel();
    onConfirm();
  };

  const onKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      onCancel();
      onConfirm();
    }

    if (event.key === "Escape") {
      onCancel();
    }
  };

  return (
    <Input
      autoFocus
      placeholder="Add email"
      className="h-8 w-full"
      value={email}
      onChange={(event) => setEmail(event.target.value)}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
    />
  );
};

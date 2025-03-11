"use client";

import { trpc } from "@/server/client";
import { Button } from "@conquest/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@conquest/ui/dropdown-menu";
import type { Member } from "@conquest/zod/schemas/member.schema";
import { Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { v4 as uuid } from "uuid";
import { Email } from "../custom/email";

type Props = {
  member: Member;
};

export const EditableEmails = ({ member }: Props) => {
  const [open, setOpen] = useState(false);

  const { mutateAsync: updateMember } = trpc.members.update.useMutation();

  const memberEmails = [
    member.primary_email,
    ...(member.secondary_emails ?? []),
  ].filter((email): email is string => email !== null);

  const [emails, setEmails] = useState<{ id: string; content: string }[]>(
    memberEmails.map((email) => ({ id: uuid(), content: email })),
  );

  const onAddEmail = () => {
    setEmails([...emails, { id: uuid(), content: "" }]);
  };

  const onChangeEmail = (id: string, newEmail: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(newEmail)) {
      const newEmails = emails.filter((email) => email.id !== id);
      setEmails(newEmails);
      updateMember({
        ...member,
        primary_email: newEmails[0]?.content ?? "",
        secondary_emails: newEmails.slice(1).map((email) => email.content),
      });
      return toast.error("Invalid email format");
    }

    const updatedEmails = emails.map((email) =>
      email.id === id ? { id: email.id, content: newEmail } : email,
    );
    setEmails(updatedEmails);
    updateMember({
      ...member,
      primary_email: updatedEmails[0]?.content ?? "",
      secondary_emails: updatedEmails.slice(1).map((email) => email.content),
    });
  };

  const onDeleteEmail = (id: string) => {
    const updatedEmails = emails.filter((email) => email.id !== id);
    setEmails(updatedEmails);
    updateMember({
      ...member,
      primary_email: updatedEmails[0]?.content ?? "",
      secondary_emails: updatedEmails.slice(1).map((email) => email.content),
    });
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild className="w-full cursor-pointer">
        {emails.filter((email) => email.content !== "").length > 0 ? (
          <div className="min-h-8 space-y-1 rounded-md p-1 hover:bg-muted-hover">
            {emails.map((email) => {
              if (email.content === "") return;
              return (
                <Button
                  key={email.id}
                  variant="outline"
                  size="xs"
                  className="w-fit justify-start border-main-200 text-main-400 hover:bg-background hover:text-main-400"
                >
                  {email.content}
                </Button>
              );
            })}
          </div>
        ) : (
          <Button variant="ghost" className="justify-start">
            Set emails
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {emails.length > 0 && (
          <>
            <div className="space-y-0.5">
              {emails.map((email) => (
                <Email
                  key={email.id}
                  email={email}
                  hasEmails={emails.length > 1}
                  setOpen={setOpen}
                  onChangeEmail={(newEmail) =>
                    onChangeEmail(email.id, newEmail.email)
                  }
                  onDeleteEmail={onDeleteEmail}
                />
              ))}
            </div>
            <DropdownMenuSeparator />
          </>
        )}
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={onAddEmail}
        >
          <Plus size={16} />
          Add email
        </Button>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

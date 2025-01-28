"use client";

import { updateMember } from "@/actions/members/updateMember";
import { Button } from "@conquest/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@conquest/ui/dropdown-menu";
import type { Member } from "@conquest/zod/schemas/member.schema";
import cuid from "cuid";
import { Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Email } from "./email";

type Props = {
  member: Member;
};

export const EditableEmails = ({ member }: Props) => {
  const [open, setOpen] = useState(false);

  const memberEmails = [
    member.primary_email,
    ...(member.secondary_emails ?? []),
  ].filter((email): email is string => email !== null);

  const [emails, setEmails] = useState<{ id: string; content: string }[]>(
    memberEmails.map((email) => ({ id: cuid(), content: email })),
  );

  const onAddEmail = () => {
    setEmails([...emails, { id: cuid(), content: "" }]);
  };

  const onChangeEmail = (id: string, newEmail: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(newEmail)) {
      const newEmails = emails.filter((email) => email.id !== id);
      setEmails(newEmails);
      updateMember({
        id: member.id,
        primary_email: newEmails[0]?.content,
        secondary_emails: newEmails.slice(1).map((email) => email.content),
      });
      return toast.error("Invalid email format");
    }

    const updatedEmails = emails.map((email) =>
      email.id === id ? { id: email.id, content: newEmail } : email,
    );
    setEmails(updatedEmails);
    updateMember({
      id: member.id,
      primary_email: updatedEmails[0]?.content,
      secondary_emails: updatedEmails.slice(1).map((email) => email.content),
    });
  };

  const onDeleteEmail = (id: string) => {
    const updatedEmails = emails.filter((email) => email.id !== id);
    setEmails(updatedEmails);
    updateMember({
      id: member.id,
      primary_email: updatedEmails[0]?.content,
      secondary_emails: updatedEmails.slice(1).map((email) => email.content),
    });
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild className="w-full cursor-pointer">
        {emails.filter((email) => email.content !== "").length > 0 ? (
          <div className="flex w-full flex-col gap-1 truncate rounded-md p-1 hover:bg-muted">
            {emails.map((email) => {
              if (email.content === "") return;
              return (
                <p
                  key={email.id}
                  className="h-6 w-fit max-w-[225px] place-content-center truncate rounded-md border border-blue-200 bg-background px-1.5 text-blue-500 hover:text-blue-500"
                >
                  {email.content}
                </p>
              );
            })}
          </div>
        ) : (
          <Button
            variant="ghost"
            classNameSpan="text-muted-foreground justify-start"
          >
            Set emails
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[233px]">
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
          className="w-full"
          classNameSpan="justify-start"
          onClick={onAddEmail}
        >
          <Plus size={16} />
          Add email
        </Button>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

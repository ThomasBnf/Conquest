"use client";

import { updateMember } from "@/actions/members/updateMember";
import { Button } from "@conquest/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@conquest/ui/src/components/dropdown-menu";
import type { Member } from "@conquest/zod/member.schema";
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
  const [emails, setEmails] = useState<{ id: string; content: string }[]>(
    member.emails.map((email) => ({ id: cuid(), content: email })),
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
        emails: newEmails.map((email) => email.content),
      });
      return toast.error("Invalid email format");
    }

    const updatedEmails = emails.map((email) =>
      email.id === id ? { id: email.id, content: newEmail } : email,
    );
    setEmails(updatedEmails);
    updateMember({
      id: member.id,
      emails: updatedEmails.map((email) => email.content),
    });
  };

  const onDeleteEmail = (id: string) => {
    const updatedEmails = emails.filter((email) => email.id !== id);
    setEmails(updatedEmails);
    updateMember({
      id: member.id,
      emails: updatedEmails.map((email) => email.content),
    });
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild className="w-full cursor-pointer">
        {emails.filter((email) => email.content !== "").length > 0 ? (
          <div className="flex w-full flex-col gap-1 rounded-md p-1 hover:bg-muted">
            {emails.map((email) => {
              if (email.content === "") return;
              return (
                <Button
                  key={email.id}
                  variant="outline"
                  size="xs"
                  className="w-fit justify-start border-blue-200 text-blue-500 hover:bg-background hover:text-blue-500"
                >
                  {email.content}
                </Button>
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
      <DropdownMenuContent align="start" className="w-[297px]">
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
          <Plus size={15} />
          Add email
        </Button>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

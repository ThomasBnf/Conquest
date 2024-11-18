"use client";

import { _updateMember } from "@/features/members/actions/_updateMember";
import { Button } from "@conquest/ui/button";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@conquest/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@conquest/ui/popover";
import { Separator } from "@conquest/ui/separator";
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
  const [isOpen, setIsOpen] = useState(false);
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
      _updateMember({
        id: member.id,
        emails: newEmails.map((email) => email.content),
      });
      return toast.error("Invalid email format");
    }

    const updatedEmails = emails.map((email) =>
      email.id === id ? { id: email.id, content: newEmail } : email,
    );
    setEmails(updatedEmails);
    _updateMember({
      id: member.id,
      emails: updatedEmails.map((email) => email.content),
    });
  };

  const onDeleteEmail = (id: string) => {
    const updatedEmails = emails.filter((email) => email.id !== id);
    setEmails(updatedEmails);
    _updateMember({
      id: member.id,
      emails: updatedEmails.map((email) => email.content),
    });
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild className="w-full cursor-pointer">
        {emails.filter((email) => email.content !== "").length > 0 ? (
          <div className="flex flex-col gap-1 w-full hover:bg-muted rounded-md p-1">
            {emails.map((email) => {
              if (email.content === "") return;
              return (
                <Button
                  key={email.id}
                  variant="outline"
                  size="xs"
                  className="text-blue-500 hover:text-blue-500 hover:bg-background justify-start w-fit"
                  onClick={() => setIsOpen(true)}
                >
                  {email.content}
                </Button>
              );
            })}
          </div>
        ) : (
          <Button
            variant="ghost"
            size="xs"
            classNameSpan="text-muted-foreground justify-start"
          >
            Set emails
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72 p-0">
        <Command loop>
          <CommandList>
            <CommandGroup>
              {emails.map((email, index) => (
                <Email
                  key={email.id}
                  email={email}
                  index={index}
                  setIsOpen={setIsOpen}
                  onChangeEmail={(newEmail) =>
                    onChangeEmail(email.id, newEmail.email)
                  }
                  onDeleteEmail={onDeleteEmail}
                />
              ))}
              <Separator className="-mx-2 w-[calc(100%+1rem)] my-1" />
              <CommandItem onSelect={onAddEmail}>
                <Plus size={15} />
                <p>Add email</p>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

"use client";

import { Button } from "@conquest/ui/button";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@conquest/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@conquest/ui/popover";
import { Separator } from "@conquest/ui/separator";
import type { Contact } from "@conquest/zod/contact.schema";
import { updateContact } from "actions/contacts/updateContact";
import cuid from "cuid";
import { Mail, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Email } from "./email";

type Props = {
  contact: Contact;
};

export const EditableEmails = ({ contact }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [emails, setEmails] = useState<{ id: string; content: string }[]>(
    contact.emails.map((email) => ({ id: cuid(), content: email })),
  );

  const onAddEmail = () => {
    setEmails([...emails, { id: cuid(), content: "" }]);
  };

  const onChangeEmail = (id: string, newEmail: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      const newEmails = emails.filter((email) => email.id !== id);
      setEmails(newEmails);
      updateContact({
        id: contact.id,
        emails: newEmails.map((email) => email.content),
      });
      return toast.error("Invalid email format");
    }
    const updatedEmails = emails.map((email) =>
      email.id === id ? { id: email.id, content: newEmail } : email,
    );
    setEmails(updatedEmails);
    updateContact({
      id: contact.id,
      emails: updatedEmails.map((email) => email.content),
    });
  };

  const onDeleteEmail = (id: string) => {
    const updatedEmails = emails.filter((email) => email.id !== id);
    setEmails(updatedEmails);
    updateContact({
      id: contact.id,
      emails: updatedEmails.map((email) => email.content),
    });
  };

  return (
    <div className="flex items-start gap-1.5">
      <Mail size={15} className="mt-[3px] shrink-0 text-muted-foreground" />
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="xs"
            className="h-fit"
            onClick={() => {
              if (emails.length === 0) {
                onAddEmail();
              }
            }}
          >
            {emails.length === 0 || emails[0]?.content === "" ? (
              <span className="text-muted-foreground">Set emails</span>
            ) : (
              <div className="flex flex-col items-start gap-1">
                {emails.map((email) => {
                  if (email.content === "") return;
                  return <p key={email.id}>{email.content}</p>;
                })}
              </div>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-80 p-0">
          <Command loop>
            <CommandList>
              <CommandGroup>
                {emails.map((email) => (
                  <Email
                    key={email.id}
                    email={email}
                    setIsOpen={setIsOpen}
                    onChangeEmail={(newEmail) =>
                      onChangeEmail(email.id, newEmail.email)
                    }
                    onDeleteEmail={onDeleteEmail}
                  />
                ))}
                <Separator className="-mx-2 w-[calc(100%+1rem)]" />
                <CommandItem onClick={onAddEmail} onSelect={onAddEmail}>
                  <Plus size={15} />
                  <p>Add email</p>
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

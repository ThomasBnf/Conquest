import { Button } from "@conquest/ui/button";
import type { Member } from "@conquest/zod/schemas/member.schema";
import { useState } from "react";
import { EditEmail } from "../custom/edit-email";
import { Email } from "../custom/email";

type Props = {
  member: Member;
  onUpdate: (field: keyof Member, value: string | string[]) => void;
};

export const EditableEmails = ({ member, onUpdate }: Props) => {
  const { emails } = member;
  const [adding, setAdding] = useState(false);

  return (
    <div className="flex flex-col gap-0.5">
      {emails.map((email) => (
        <EditEmail
          key={email}
          member={member}
          email={email}
          onUpdate={onUpdate}
        />
      ))}
      {adding ? (
        <Email
          member={member}
          onUpdate={onUpdate}
          onCancel={() => setAdding(false)}
        />
      ) : (
        <Button
          variant="ghost"
          className="w-full justify-start border border-transparent text-muted-foreground"
          onClick={() => setAdding(true)}
        >
          Add email
        </Button>
      )}
    </div>
  );
};

import { Button } from "@conquest/ui/button";
import type { Member } from "@conquest/zod/schemas/member.schema";
import { useState } from "react";
import { EditPhone } from "../custom/edit-phone";
import { Phone } from "../custom/phone";

type Props = {
  member: Member;
  onUpdate: (field: keyof Member, value: string | string[]) => void;
};

export const EditablePhones = ({ member, onUpdate }: Props) => {
  const { phones } = member;
  const [adding, setAdding] = useState(false);

  return (
    <div className="flex flex-col gap-0.5">
      {phones.map((phone) => (
        <EditPhone
          key={phone}
          member={member}
          phone={phone}
          onUpdate={onUpdate}
        />
      ))}
      {adding ? (
        <Phone
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
          Add phone
        </Button>
      )}
    </div>
  );
};

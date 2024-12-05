import { Button } from "@conquest/ui/button";
import { Input } from "@conquest/ui/input";
import { X } from "lucide-react";
import { useState } from "react";

type Props = {
  email: { id: string; content: string };
  hasEmails: boolean;
  setOpen: (open: boolean) => void;
  onChangeEmail: ({ id, email }: { id: string; email: string }) => void;
  onDeleteEmail: (email: string) => void;
};

export const Email = ({
  email,
  hasEmails,
  setOpen,
  onChangeEmail,
  onDeleteEmail,
}: Props) => {
  const [value, setValue] = useState(email.content);

  return (
    <div className="group flex h-8 items-center justify-between gap-1 px-2">
      {email.content ? (
        <p className="truncate">{email.content}</p>
      ) : (
        <Input
          autoFocus
          placeholder="email@example.com"
          variant="transparent"
          className="h-8 px-0"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              if (value === "") return;
              onChangeEmail({ id: email.id, email: value });
              setOpen(false);
            }
            if (event.key === "Escape") {
              setOpen(false);
              onDeleteEmail(email.id);
            }
          }}
        />
      )}
      <Button
        variant="outline"
        size="icon"
        className="ml-auto shrink-0 opacity-0 group-hover:opacity-100"
        onClick={() => onDeleteEmail(email.id)}
      >
        <X size={15} />
      </Button>
    </div>
  );
};

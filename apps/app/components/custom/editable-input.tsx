import { Button } from "@conquest/ui/button";
import { Input } from "@conquest/ui/input";
import { TextField } from "@conquest/ui/text-field";
import { cn } from "@conquest/ui/utils/cn";
import { useState } from "react";

type Props = {
  defaultValue: string | null;
  placeholder?: string;
  onUpdate: (value: string) => void;
  textArea?: boolean;
};

export const EditableInput = ({
  defaultValue,
  placeholder,
  onUpdate,
  textArea,
}: Props) => {
  const [value, setValue] = useState(defaultValue);
  const [isFocus, setIsFocus] = useState(false);

  if (!isFocus) {
    return (
      <Button
        variant="ghost"
        size="xs"
        onClick={() => setIsFocus(true)}
        className={cn("-ml-1.5", value && "h-fit")}
        classNameSpan={cn(value && "text-start")}
      >
        {value ? (
          value
        ) : (
          <span className="text-muted-foreground">{placeholder}</span>
        )}
      </Button>
    );
  }

  return (
    <>
      {textArea ? (
        <TextField
          autoFocus
          className="h-8"
          rows={3}
          value={value ?? ""}
          onChange={(event) => setValue(event.target.value)}
          onBlur={(event) => {
            onUpdate(event.target.value);
            setIsFocus(false);
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              onUpdate(value ?? "");
              setIsFocus(false);
            }
          }}
        />
      ) : (
        <Input
          autoFocus
          className="h-7 px-[3px]"
          value={value ?? ""}
          onChange={(event) => setValue(event.target.value)}
          onBlur={(event) => {
            onUpdate(event.target.value);
            setIsFocus(false);
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              onUpdate(value ?? "");
              setIsFocus(false);
            }
          }}
        />
      )}
    </>
  );
};

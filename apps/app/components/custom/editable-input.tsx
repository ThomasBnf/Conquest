import { Button } from "@conquest/ui/button";
import { cn } from "@conquest/ui/cn";
import { Input } from "@conquest/ui/input";
import { TextField } from "@conquest/ui/text-field";
import { useState } from "react";
type Props = {
  defaultValue: string | null;
  placeholder?: string;
  onUpdate: (value: string) => void;
  textArea?: boolean;
  className?: string;
};

export const EditableInput = ({
  defaultValue,
  placeholder,
  onUpdate,
  textArea,
  className,
}: Props) => {
  const [value, setValue] = useState(defaultValue);
  const [isFocus, setIsFocus] = useState(false);

  const onBlur = (value: string) => {
    if (!value) {
      setIsFocus(false);
      return;
    }

    onUpdate(value);
    setIsFocus(false);
  };

  const onKeyDown = (key: string) => {
    if (key === "Enter") {
      if (!value) {
        setIsFocus(false);
        return;
      }
      onUpdate(value ?? "");
      setIsFocus(false);
    }
  };

  if (!isFocus) {
    return (
      <Button
        variant="ghost"
        size="xs"
        onClick={() => setIsFocus(true)}
        className={cn(className, "h-8 w-full")}
        classNameSpan={cn(
          "justify-start text-start",
          value ? "line-clamp-1" : "text-muted-foreground",
        )}
      >
        {value === "" || value === null ? placeholder : value}
      </Button>
    );
  }

  return (
    <>
      {textArea ? (
        <TextField
          autoFocus
          rows={3}
          value={value ?? ""}
          onChange={(event) => setValue(event.target.value)}
          onBlur={(event) => onBlur(event.target.value)}
          onKeyDown={(event) => onKeyDown(event.key)}
          className={cn("p-[5px]", className)}
        />
      ) : (
        <Input
          autoFocus
          className="h-8 p-[5px]"
          value={value ?? ""}
          onChange={(event) => setValue(event.target.value)}
          onBlur={(event) => onBlur(event.target.value)}
          onKeyDown={(event) => onKeyDown(event.key)}
        />
      )}
    </>
  );
};

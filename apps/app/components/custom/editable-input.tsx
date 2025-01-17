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
    onUpdate(value);
    setIsFocus(false);
  };

  const onKeyDown = (key: string) => {
    if (key === "Enter") {
      onUpdate(value ?? "");
      setIsFocus(false);
    }
  };

  if (!isFocus) {
    return (
      <Button
        variant="ghost"
        onClick={() => setIsFocus(true)}
        className={cn(
          className,
          "w-full overflow-hidden text-muted-foreground",
        )}
        classNameSpan={cn("justify-start", value && "text-foreground")}
      >
        <span className="truncate">
          {value === "" || value === null ? placeholder : value}
        </span>
      </Button>
    );
  }

  return (
    <>
      {textArea ? (
        <TextField
          autoFocus
          value={value ?? ""}
          onChange={(event) => setValue(event.target.value)}
          onBlur={(event) => onBlur(event.target.value)}
          onKeyDown={(event) => onKeyDown(event.key)}
          className={cn("p-[5px] px-[7px]", className)}
        />
      ) : (
        <Input
          autoFocus
          className="h-8 px-[7px]"
          value={value ?? ""}
          onChange={(event) => setValue(event.target.value)}
          onBlur={(event) => onBlur(event.target.value)}
          onKeyDown={(event) => onKeyDown(event.key)}
        />
      )}
    </>
  );
};

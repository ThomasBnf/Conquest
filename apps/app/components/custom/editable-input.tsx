import { Button } from "@conquest/ui/button";
import { Input } from "@conquest/ui/input";
import { TextField } from "@conquest/ui/text-field";
import { cn } from "@conquest/ui/utils/cn";
import { useState } from "react";
import { toast } from "sonner";
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
      toast.error("Field cannot be empty");
      return;
    }

    onUpdate(value);
    setIsFocus(false);
  };

  const onKeyDown = (key: string) => {
    if (key === "Enter") {
      if (!value) {
        toast.error("Field cannot be empty");
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
        className={cn("py-0.5", value && "h-fit", className)}
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
          rows={3}
          value={value ?? ""}
          onChange={(event) => setValue(event.target.value)}
          onBlur={(event) => onBlur(event.target.value)}
          onKeyDown={(event) => onKeyDown(event.key)}
          className={className}
        />
      ) : (
        <Input
          autoFocus
          className="h-8 px-[5px]"
          value={value ?? ""}
          onChange={(event) => setValue(event.target.value)}
          onBlur={(event) => onBlur(event.target.value)}
          onKeyDown={(event) => onKeyDown(event.key)}
        />
      )}
    </>
  );
};

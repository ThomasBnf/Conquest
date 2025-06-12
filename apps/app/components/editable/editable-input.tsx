import { Button } from "@conquest/ui/button";
import { cn } from "@conquest/ui/cn";
import { Input } from "@conquest/ui/input";
import { TextField } from "@conquest/ui/text-field";
import { KeyboardEvent, useState } from "react";
import { CopyButton } from "../custom/copy-button";

type Props = {
  defaultValue: string | null | undefined;
  placeholder: string;
  onUpdate: (value: string) => void;
  customField?: boolean;
  copyable?: boolean;
};

export const EditableInput = ({
  defaultValue,
  placeholder,
  onUpdate,
  customField = false,
  copyable = true,
}: Props) => {
  const [isFocus, setIsFocus] = useState(false);
  const [isHover, setIsHover] = useState(false);

  const onBlur = (value: string) => {
    onUpdate(value);
    onCancel();
  };

  const onKeyDown = (
    event: KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>,
  ) => {
    const { key, shiftKey } = event;
    const value = event.currentTarget.value;

    if (key === "Escape") {
      onCancel();
    }

    if (key === "Enter" && !shiftKey) {
      onUpdate(value);
      onCancel();
    }
  };

  const onCancel = () => {
    setIsFocus(false);
    setIsHover(false);
  };

  if (!isFocus) {
    return (
      <div
        className="-ml-[9px] relative flex items-center"
        onMouseEnter={() => setIsHover(true)}
        onMouseLeave={() => setIsHover(false)}
      >
        <Button
          variant="ghost"
          className={cn(
            "h-fit min-h-8 w-full justify-start whitespace-pre-wrap border border-transparent text-left",
            !defaultValue && "text-muted-foreground",
          )}
          onClick={() => setIsFocus(true)}
        >
          {!defaultValue || defaultValue === ""
            ? placeholder
            : defaultValue.trim()}
        </Button>
        {isHover && !isFocus && defaultValue && copyable && (
          <CopyButton
            value={defaultValue}
            className="absolute top-1 right-1 z-10"
          />
        )}
      </div>
    );
  }

  if (customField) {
    return (
      <TextField
        autoFocus
        rows={3}
        defaultValue={defaultValue ?? ""}
        onBlur={(event) => onBlur(event.target.value)}
        onKeyDown={(event) => onKeyDown(event)}
        className="h-8"
      />
    );
  }

  return (
    <Input
      autoFocus
      defaultValue={defaultValue ?? ""}
      onBlur={(event) => onBlur(event.target.value)}
      onKeyDown={(event) => onKeyDown(event)}
      className="h-8"
    />
  );
};

import { PhoneInput } from "@/components/custom/phone-input";
import { Button } from "@conquest/ui/button";
import { cn } from "@conquest/ui/cn";
import { useState } from "react";

type Props = {
  defaultValue: string | null;
  placeholder?: string;
  onUpdate: (value: string) => void;
};

export const EditablePhone = ({
  defaultValue,
  placeholder,
  onUpdate,
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
    <PhoneInput
      value={value ?? ""}
      onChange={setValue}
      onBlur={(event: React.FocusEvent<HTMLInputElement>) => {
        onUpdate(event.target.value);
        setIsFocus(false);
      }}
      defaultCountry="FR"
    />
  );
};

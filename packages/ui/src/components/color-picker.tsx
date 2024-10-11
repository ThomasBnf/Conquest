"use client";

import { ChevronDown } from "lucide-react";
import { forwardRef, useCallback, useState } from "react";
import { HexColorPicker } from "react-colorful";
import { Button } from "./button";
import { Input } from "./input";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

interface ColorPickerProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
}

const ColorPicker = forwardRef<
  HTMLInputElement,
  ColorPickerProps &
    Omit<
      React.ComponentPropsWithoutRef<typeof Button>,
      "value" | "onChange" | "onBlur"
    >
>(({ disabled, value, onChange, onBlur, name, className, ...props }, ref) => {
  const [open, setOpen] = useState(false);

  const handleValueChange = useCallback(
    (newValue: string) => {
      onChange(newValue);
    },
    [onChange],
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={className}
          disabled={disabled}
          onBlur={onBlur}
          {...props}
        >
          <div
            className="size-4 rounded-full"
            style={{ backgroundColor: value }}
          />
          <ChevronDown size={16} />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="flex w-[234px] flex-col gap-2">
        <HexColorPicker color={value} onChange={handleValueChange} />
        <Input
          ref={ref}
          name={name}
          value={value}
          onChange={(e) => handleValueChange(e.target.value)}
          maxLength={7}
        />
      </PopoverContent>
    </Popover>
  );
});

ColorPicker.displayName = "ColorPicker";

export { ColorPicker };
export type { ColorPickerProps };

"use client";

import { Button } from "@conquest/ui/button";
import { Calendar } from "@conquest/ui/calendar";
import { cn } from "@conquest/ui/cn";
import { Popover, PopoverContent, PopoverTrigger } from "@conquest/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import * as React from "react";

type DatePickerProps = {
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  className?: string;
  disabled?: (date: Date) => boolean;
  minDate?: Date;
  maxDate?: Date;
};

export const DatePicker = React.forwardRef<HTMLButtonElement, DatePickerProps>(
  (
    {
      value,
      onChange,
      placeholder = "Select a date",
      className,
      disabled,
      minDate = new Date("1900-01-01"),
      maxDate = new Date(),
      ...props
    },
    ref,
  ) => {
    const handleDisabled = (date: Date) => {
      if (disabled) return disabled(date);
      return date > maxDate || date < minDate;
    };

    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button
            ref={ref}
            variant="outline"
            className={cn(
              !value && "justify-start text-muted-foreground",
              className,
            )}
            {...props}
          >
            <CalendarIcon size={16} />
            {value ? format(value, "PPP") : <span>{placeholder}</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={value}
            onSelect={onChange}
            disabled={handleDisabled}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    );
  },
);

DatePicker.displayName = "DatePicker";

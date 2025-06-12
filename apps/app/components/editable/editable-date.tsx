import { Button } from "@conquest/ui/button";
import { Calendar } from "@conquest/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@conquest/ui/popover";
import { format } from "date-fns";
import { useState } from "react";

type Props = {
  defaultValue: string | undefined;
  onUpdate: (value: Date) => void;
};

export const EditableDate = ({ defaultValue, onUpdate }: Props) => {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(
    defaultValue ? new Date(defaultValue) : undefined,
  );

  const today = new Date();
  const yearsRange = 50;
  const years = Array.from(
    { length: yearsRange + 1 },
    (_, i) => today.getFullYear() - yearsRange + i,
  );

  const onUpdateDate = (newDate: Date | undefined) => {
    if (!newDate) return;

    setOpen(false);
    setDate(newDate);
    onUpdate(newDate);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild className="-ml-[9px] w-full cursor-pointer">
        {date ? (
          <Button variant="ghost" className="w-full justify-start">
            {format(date, "PPP")}
          </Button>
        ) : (
          <Button
            variant="ghost"
            className="h-8 justify-start text-muted-foreground"
            onClick={() => setOpen(true)}
          >
            Set date
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-[var(--radix-popover-width)] overflow-hidden p-0"
      >
        <Calendar
          initialFocus
          mode="single"
          captionLayout="dropdown"
          selected={date}
          onSelect={(newDate) => onUpdateDate(newDate)}
        />
      </PopoverContent>
    </Popover>
  );
};

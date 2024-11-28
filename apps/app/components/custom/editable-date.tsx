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

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild className="w-full cursor-pointer">
        {date ? (
          <Button
            variant="ghost"
            size="xs"
            className="w-full justify-start"
            classNameSpan="justify-start"
          >
            {format(date, "PPP")}
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="xs"
            className="h-8"
            classNameSpan="text-muted-foreground justify-start"
            onClick={() => setOpen(true)}
          >
            Set date
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-0">
        <Calendar
          mode="single"
          selected={date}
          defaultMonth={date}
          onSelect={(newDate) => {
            if (newDate) {
              setDate(newDate);
              onUpdate(newDate);
              setOpen(false);
            }
          }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
};

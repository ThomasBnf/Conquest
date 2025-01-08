import { MONTHS } from "@/constant";
import { Button } from "@conquest/ui/button";
import { Calendar } from "@conquest/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@conquest/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@conquest/ui/select";
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

  const onUpdateDate = (newDate: Date) => {
    setOpen(false);
    setDate(newDate);
    onUpdate(newDate);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild className="w-full cursor-pointer">
        {date ? (
          <Button
            variant="ghost"
            className="w-full justify-start"
            classNameSpan="justify-start"
          >
            {format(date, "PPP")}
          </Button>
        ) : (
          <Button
            variant="ghost"
            className="h-8"
            classNameSpan="text-muted-foreground justify-start"
            onClick={() => setOpen(true)}
          >
            Set date
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent align="end" className="w-auto p-0">
        <div className="flex gap-2 px-3 pt-3">
          <Select
            value={date ? format(date, "MMMM") : undefined}
            onValueChange={(value: (typeof MONTHS)[number]) => {
              const newDate = date
                ? new Date(
                    date.getFullYear(),
                    MONTHS.indexOf(value),
                    date.getDate(),
                  )
                : new Date();
              onUpdateDate(newDate);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Month" />
            </SelectTrigger>
            <SelectContent>
              {MONTHS.map((month) => (
                <SelectItem key={month} value={month}>
                  {month}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={date ? format(date, "yyyy") : undefined}
            onValueChange={(value) => {
              const newDate = date
                ? new Date(Number(value), date.getMonth(), date.getDate())
                : new Date();
              onUpdateDate(newDate);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Calendar
          mode="single"
          selected={date}
          defaultMonth={date}
          onSelect={(newDate) => {
            if (newDate) {
              onUpdateDate(newDate);
            }
          }}
          initialFocus
          ISOWeek
          captionLayout="buttons"
          fromYear={1900}
          toYear={2100}
        />
      </PopoverContent>
    </Popover>
  );
};

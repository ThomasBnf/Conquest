import { useFilters } from "@/context/filtersContext";
import { Button } from "@conquest/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@conquest/ui/dropdown-menu";
import { Form, FormControl, FormField, FormItem } from "@conquest/ui/form";
import { Input } from "@conquest/ui/input";
import type { DynamicDate, FilterDate } from "@conquest/zod/filters.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDown } from "lucide-react";
import { useForm } from "react-hook-form";
import { type FormDays, FormDaysSchema } from "./types/form-days.schema";

type Props = {
  filter: FilterDate;
};

export const DatePicker = ({ filter }: Props) => {
  const { onUpdateFilter } = useFilters();

  const form = useForm<FormDays>({
    resolver: zodResolver(FormDaysSchema),
    defaultValues: {
      days: filter.days,
    },
  });

  const onUpdateDate = (dynamic_date: DynamicDate) => {
    onUpdateFilter({
      ...filter,
      dynamic_date,
    });
  };

  const onChangeDays = (event: React.ChangeEvent<HTMLInputElement>) => {
    const days = Number(event.target.value);

    if (Number.isNaN(days)) return;

    form.setValue("days", days);
    onUpdateDays(days);
  };

  const onUpdateDays = (days: number) => {
    if (Number.isNaN(days)) return;

    onUpdateFilter({
      ...filter,
      days: days,
    });
  };

  return (
    <>
      {filter.dynamic_date === "days_ago" && (
        <Form {...form}>
          <FormField
            control={form.control}
            name="days"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    {...field}
                    variant="transparent"
                    placeholder="Days"
                    className="h-8"
                    onChange={(event) => onChangeDays(event)}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </Form>
      )}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="dropdown"
            className="w-full rounded-none"
            classNameSpan="justify-between"
          >
            {filter.dynamic_date ? (
              <span className="first-letter:uppercase">
                {filter.dynamic_date.replace(/_/g, " ")}
              </span>
            ) : (
              <span className="text-muted-foreground">Select date</span>
            )}
            <ChevronDown size={14} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={() => onUpdateDate("today")}>
            Today
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onUpdateDate("yesterday")}>
            Yesterday
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onUpdateDate("7_days_ago")}>
            7 days ago
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onUpdateDate("30_days_ago")}>
            30 days ago
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => onUpdateDate("days_ago")}>
            Number of days ago
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

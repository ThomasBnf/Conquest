import { TimePicker } from "@/components/custom/time-picker";
import { useSelected } from "@/features/workflows/hooks/useSelected";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@conquest/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@conquest/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@conquest/ui/toggle-group";
import { NodeRecurringSchema, type RepeatOn } from "@conquest/zod/node.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useReactFlow } from "@xyflow/react";
import { weekdays } from "constant/weekdays";
import { useForm } from "react-hook-form";
import {
  type FormRecurring,
  FormRecurringSchema,
} from "./form-recurring.schema";

export const RecurringWorkflowOptions = () => {
  const { selected } = useSelected();
  const { updateNodeData } = useReactFlow();
  const { frequency, repeat_on, time } = NodeRecurringSchema.parse(
    selected?.data,
  );

  const form = useForm<FormRecurring>({
    resolver: zodResolver(FormRecurringSchema),
    defaultValues: {
      frequency,
      repeat_on,
      time,
    },
  });

  const onSubmit = ({ frequency, repeat_on, time }: FormRecurring) => {
    if (!selected?.id) return;

    updateNodeData(selected.id, {
      ...selected?.data,
      frequency,
      repeat_on,
      time,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="frequency"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Frequency</FormLabel>
              <FormControl>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    onSubmit(form.getValues());
                  }}
                  defaultValue={field.value}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {form.getValues("frequency") !== "daily" && (
          <FormField
            control={form.control}
            name="repeat_on"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Repeat on</FormLabel>
                <FormControl>
                  <ToggleGroup
                    type="multiple"
                    onValueChange={(value: RepeatOn[]) => {
                      field.onChange(value);
                      onSubmit(form.getValues());
                    }}
                    value={field.value}
                  >
                    {weekdays.map((day) => (
                      <ToggleGroupItem
                        key={day}
                        value={day}
                        variant={
                          form.getValues("repeat_on").includes(day)
                            ? "default"
                            : "outline"
                        }
                        className="capitalize w-full"
                      >
                        {day.slice(0, 3)}
                      </ToggleGroupItem>
                    ))}
                  </ToggleGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        <FormField
          control={form.control}
          name="time"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Time</FormLabel>
              <FormControl>
                <TimePicker
                  value={field.value}
                  onChange={(e) => {
                    field.onChange(e);
                    onSubmit(form.getValues());
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
};

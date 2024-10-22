import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@conquest/ui/form";
import { Input } from "@conquest/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@conquest/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@conquest/ui/toggle-group";
import { NodeRecurringSchema } from "@conquest/zod/node.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { weekdays } from "constant/weekdays";
import { useWorkflow } from "context/workflowContext";
import { useForm } from "react-hook-form";
import {
  type FormRecurring,
  FormRecurringSchema,
} from "./form-recurring.schema";

export const RecurringScheduleOptions = () => {
  const { currentNode, onUpdateNode } = useWorkflow();

  const parsedData = NodeRecurringSchema.parse(currentNode?.data);
  const { frequency, repeat_on, time } = parsedData;

  const form = useForm<FormRecurring>({
    resolver: zodResolver(FormRecurringSchema),
    defaultValues: {
      frequency,
      repeat_on,
      time,
    },
  });

  const onSubmit = ({ frequency, repeat_on, time }: FormRecurring) => {
    if (!currentNode) return;

    onUpdateNode({
      ...currentNode,
      data: {
        ...parsedData,
        frequency,
        repeat_on,
        time,
      },
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
                    onValueChange={(value) => {
                      field.onChange(value);
                      onSubmit(form.getValues());
                    }}
                    value={field.value}
                  >
                    {weekdays.map((day) => (
                      <ToggleGroupItem
                        key={day}
                        value={day}
                        variant="outline"
                        size="sm"
                        className="data-[state=on]:border-main-500"
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
                <Input
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);
                    form.trigger("time");
                  }}
                  onBlur={() => {
                    if (form.formState.isValid) {
                      onSubmit(form.getValues());
                    }
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

import { useSelected } from "@/features/workflows/hooks/useSelected";
import { Form, FormControl, FormField, FormItem } from "@conquest/ui/form";
import { Input } from "@conquest/ui/input";
import { Label } from "@conquest/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@conquest/ui/select";
import { NodeWaitSchema } from "@conquest/zod/node.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useReactFlow } from "@xyflow/react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { type FormWait, FormWaitSchema } from "./form-wait.schema";

export const WaitOptions = () => {
  const { selected } = useSelected();
  const { updateNodeData } = useReactFlow();

  const parsedData = NodeWaitSchema.parse(selected?.data);
  const { duration, unit } = parsedData;

  const form = useForm<FormWait>({
    resolver: zodResolver(FormWaitSchema),
    defaultValues: {
      duration,
      unit,
    },
  });

  useEffect(() => {
    form.reset({
      duration,
      unit,
    });
  }, [selected]);

  const onSubmit = ({ duration, unit }: FormWait) => {
    if (!selected) return;

    console.log(duration, unit);

    updateNodeData(selected.id, {
      ...parsedData,
      duration,
      unit,
    });
  };

  const onSelectUnit = (value: "seconds" | "minutes" | "hours" | "days") => {
    form.setValue("unit", value);
    onSubmit({ duration, unit: value });
  };

  return (
    <div>
      <Label>Wait</Label>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-1 border border-input shadow-sm items-center justify-between rounded-lg divide-x h-10 overflow-hidden"
        >
          <FormField
            control={form.control}
            name="duration"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    onBlur={() => onSubmit({ duration: field.value, unit })}
                    variant="transparent"
                    className="w-full"
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="unit"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Select
                    onValueChange={(unit) =>
                      onSelectUnit(
                        unit as "seconds" | "minutes" | "hours" | "days",
                      )
                    }
                    defaultValue={field.value}
                  >
                    <SelectTrigger className="border-none px-2 w-28 h-10 shadow-none bg-muted-hover m-0 rounded-none">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="seconds">Seconds</SelectItem>
                      <SelectItem value="minutes">Minutes</SelectItem>
                      <SelectItem value="hours">Hours</SelectItem>
                      <SelectItem value="days">Days</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
              </FormItem>
            )}
          />
        </form>
      </Form>
    </div>
  );
};

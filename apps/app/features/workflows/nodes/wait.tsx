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
import { NodeWaitSchema } from "@conquest/zod/schemas/node.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useReactFlow } from "@xyflow/react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { usePanel } from "../hooks/usePanel";
import { type FormWait, FormWaitSchema } from "./schemas/form-wait.schema";

export const Wait = () => {
  const { node } = usePanel();
  const { updateNodeData } = useReactFlow();

  const parsedData = NodeWaitSchema.parse(node?.data);
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
  }, [node]);

  const onSubmit = ({ duration, unit }: FormWait) => {
    if (!node) return;

    updateNodeData(node.id, {
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
          className="flex h-10 flex-1 items-center justify-between divide-x overflow-hidden rounded-md border border-input shadow-sm"
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
                    <SelectTrigger className="m-0 h-10 w-28 rounded-none border-none bg-muted-hover px-2 shadow-none">
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

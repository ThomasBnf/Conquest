import { useSelected } from "@/features/workflows/hooks/useSelected";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@conquest/ui/form";
import { TextField } from "@conquest/ui/text-field";
import { NodeSlackMessage } from "@conquest/zod/schemas/node.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useReactFlow } from "@xyflow/react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useDebouncedCallback } from "use-debounce";
import { VariablePicker } from "../components/variable-picker";
import { type FormSlack, FormSlackSchema } from "./schemas/form-slack.schema";

export const SlackMessage = () => {
  const { selected } = useSelected();
  const { updateNodeData } = useReactFlow();

  const parsedData = NodeSlackMessage.parse(selected?.data);
  const { message } = parsedData;

  const form = useForm<FormSlack>({
    resolver: zodResolver(FormSlackSchema),
    defaultValues: {
      message: message ?? "",
    },
  });

  useEffect(() => {
    form.reset({
      message: message ?? "",
    });
  }, [selected]);

  const onSubmit = ({ message }: FormSlack) => {
    if (!selected) return;

    updateNodeData(selected.id, {
      ...parsedData,
      message,
    });
  };

  const debouncedSubmit = useDebouncedCallback(
    (newMessage: string) => onSubmit({ message: newMessage }),
    500,
  );

  const onSetVariable = (variable: string) => {
    const newMessage = message + variable;

    form.setValue("message", newMessage);
    onSubmit({ message: newMessage });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Message</FormLabel>
              <FormControl>
                <TextField
                  {...field}
                  placeholder="Add a message"
                  onChange={(e) => {
                    form.setValue("message", e.target.value);
                    debouncedSubmit(e.target.value);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <VariablePicker onClick={onSetVariable} />
      </form>
    </Form>
  );
};

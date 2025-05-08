import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@conquest/ui/form";
import { TextField } from "@conquest/ui/text-field";
import { NodeSlackMessageSchema } from "@conquest/zod/schemas/node.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useReactFlow } from "@xyflow/react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useDebouncedCallback } from "use-debounce";
import { usePanel } from "../hooks/usePanel";
import { VariablePicker } from "../components/variable-picker";
import { type FormSlack, FormSlackSchema } from "./schemas/form-slack.schema";

export const SlackMessage = () => {
  const { node } = usePanel();
  const { updateNodeData } = useReactFlow();

  const parsedData = NodeSlackMessageSchema.parse(node?.data);
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
  }, [node]);

  const onSubmit = ({ message }: FormSlack) => {
    if (!node) return;

    updateNodeData(node.id, {
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

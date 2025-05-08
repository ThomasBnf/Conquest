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
import { VariablePicker } from "../components/variable-picker";
import { usePanel } from "../hooks/usePanel";
import { type FormSlack, FormSlackSchema } from "./schemas/form-slack.schema";

export const SlackMessage = () => {
  const { node } = usePanel();
  const { updateNodeData } = useReactFlow();

  const { message } = NodeSlackMessageSchema.parse(node?.data);

  const form = useForm<FormSlack>({
    resolver: zodResolver(FormSlackSchema),
    defaultValues: {
      message,
    },
  });

  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!node) return;

    form.setValue("message", e.target.value);

    updateNodeData(node?.id, {
      ...node.data,
      message: e.target.value,
    });
  };

  const onSetVariable = (variable: string) => {
    if (!node) return;

    const currentMessage = form.getValues("message");
    const newMessage = currentMessage + variable;

    form.setValue("message", newMessage);

    updateNodeData(node?.id, {
      ...node.data,
      message: newMessage,
    });
  };

  useEffect(() => {
    form.setValue("message", message ?? "");
  }, [message]);

  return (
    <Form {...form}>
      <form className="space-y-2">
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
                  onChange={onChange}
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

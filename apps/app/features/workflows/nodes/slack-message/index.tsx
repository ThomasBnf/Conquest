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
import { NodeSlackMessage } from "@conquest/zod/node.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useReactFlow } from "@xyflow/react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { type FormSlack, FormSlackSchema } from "./form-slack.schema";

export const SlackMessageOptions = () => {
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
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
                    field.onChange(e);
                    onSubmit({ message: e.target.value });
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

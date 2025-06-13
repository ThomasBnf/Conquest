import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@conquest/ui/form";
import { TextField } from "@conquest/ui/text-field";
import { NodeDiscordMessageSchema } from "@conquest/zod/schemas/node.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useReactFlow } from "@xyflow/react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { ChannelVariablePicker } from "../components/channel-variable-picker";
import { MemberVariablePicker } from "../components/member-variable-picker";
import { useWorkflow } from "../context/workflowContext";
import { FormDiscord, FormDiscordSchema } from "./schemas/form-discord.schema";
import { TestDiscordMessage } from "./test-discord-message";

export const DiscordMessage = () => {
  const { node } = useWorkflow();
  const { updateNodeData } = useReactFlow();
  const { message } = NodeDiscordMessageSchema.parse(node?.data);

  const form = useForm<FormDiscord>({
    resolver: zodResolver(FormDiscordSchema),
    defaultValues: {
      message,
    },
  });

  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!node) return;

    form.setValue("message", e.target.value);
  };

  const onBlur = () => {
    if (!node) return;

    const message = form.getValues("message");

    updateNodeData(node?.id, {
      ...node.data,
      message,
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
                  onBlur={onBlur}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex gap-2">
          <MemberVariablePicker onClick={onSetVariable} />
          <ChannelVariablePicker source="Discord" onClick={onSetVariable} />
          <TestDiscordMessage message={message} />
        </div>
      </form>
    </Form>
  );
};

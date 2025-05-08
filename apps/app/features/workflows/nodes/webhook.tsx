import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@conquest/ui/form";
import { Input } from "@conquest/ui/input";
import { TextField } from "@conquest/ui/text-field";
import { NodeWebhookSchema } from "@conquest/zod/schemas/node.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useReactFlow } from "@xyflow/react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { VariablePicker } from "../components/variable-picker";
import { usePanel } from "../hooks/usePanel";
import {
  type FormWebhook,
  FormWebhookSchema,
} from "./schemas/form-webhook.schema";

export const Webhook = () => {
  const { node } = usePanel();
  const { updateNodeData } = useReactFlow();

  const { url, body } = NodeWebhookSchema.parse(node?.data);

  const form = useForm<FormWebhook>({
    resolver: zodResolver(FormWebhookSchema),
    defaultValues: {
      url,
      body,
    },
  });

  const onChangeUrl = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!node) return;

    form.setValue("url", e.target.value);

    updateNodeData(node?.id, {
      ...node.data,
      url: e.target.value,
    });
  };

  const onChangeBody = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!node) return;

    form.setValue("body", e.target.value);

    updateNodeData(node?.id, {
      ...node.data,
      body: e.target.value,
    });
  };

  const onSetVariable = (variable: string) => {
    if (!node) return;

    const currentBody = form.getValues("body");
    const newBody = currentBody + variable;

    form.setValue("body", newBody);
    updateNodeData(node?.id, {
      ...node.data,
      body: newBody,
    });
  };

  useEffect(() => {
    if (!node) return;

    form.reset({ url, body });
  }, [node]);

  return (
    <Form {...form}>
      <form className="space-y-4">
        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Webhook URL</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Webhook URL"
                  onChange={onChangeUrl}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <div className="space-y-2">
          <FormField
            control={form.control}
            name="body"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Body</FormLabel>
                <FormControl>
                  <TextField
                    {...field}
                    placeholder="Body"
                    onChange={onChangeBody}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <VariablePicker onClick={onSetVariable} />
        </div>
      </form>
    </Form>
  );
};

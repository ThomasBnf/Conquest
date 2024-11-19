import { useSelected } from "@/features/workflows/hooks/useSelected";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@conquest/ui/form";
import { Input } from "@conquest/ui/input";
import { TextField } from "@conquest/ui/text-field";
import { NodeWebhookSchema } from "@conquest/zod/node.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useReactFlow } from "@xyflow/react";
import { useForm } from "react-hook-form";
import { type FormUrl, FormUrlSchema } from "./form-url.schema";

export const WebhookOptions = () => {
  const { selected } = useSelected();
  const { setNodes } = useReactFlow();

  const { url, body } = NodeWebhookSchema.parse(selected?.data);

  const form = useForm<FormUrl>({
    resolver: zodResolver(FormUrlSchema),
    defaultValues: {
      url,
    },
  });

  const onSubmit = ({ url, body }: FormUrl) => {
    if (!selected) return;

    setNodes((nodes) =>
      nodes.map((node) =>
        node.id === selected.id
          ? { ...node, data: { ...node.data, url } }
          : node,
      ),
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                  onBlur={(e) => {
                    form.setValue("url", e.target.value);
                    if (e.target.value !== "") {
                      onSubmit({ url: e.target.value });
                    }
                  }}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="body"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Body</FormLabel>
              <FormControl>
                <TextField {...field} placeholder="Body" />
              </FormControl>
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
};

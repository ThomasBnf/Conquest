import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@conquest/ui/form";
import { Input } from "@conquest/ui/input";
import { NodeWebhookSchema } from "@conquest/zod/node.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useReactFlow } from "@xyflow/react";
import { useForm } from "react-hook-form";
import { useSelected } from "../../hooks/useSelected";
import { type FormUrl, FormUrlSchema } from "./form-url.schema";

export const WebhookOptions = () => {
  const { selected } = useSelected();
  const { getNodes, setNodes } = useReactFlow();

  const { url } = NodeWebhookSchema.parse(selected?.data);

  const form = useForm<FormUrl>({
    resolver: zodResolver(FormUrlSchema),
    defaultValues: {
      url,
    },
  });

  const onSubmit = ({ url }: FormUrl) => {
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
      <form onSubmit={form.handleSubmit(onSubmit)}>
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
      </form>
    </Form>
  );
};

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
import { useWorkflow } from "context/workflowContext";
import { useForm } from "react-hook-form";
import { type FormUrl, FormUrlSchema } from "./form-url.schema";

export const WebhookOptions = () => {
  const { currentNode, onUpdateNode } = useWorkflow();
  const parsedData = NodeWebhookSchema.parse(currentNode?.data);

  const form = useForm<FormUrl>({
    resolver: zodResolver(FormUrlSchema),
    defaultValues: {
      url: parsedData.url,
    },
  });

  const onSubmit = ({ url }: FormUrl) => {
    if (!currentNode) return;

    onUpdateNode({
      ...currentNode,
      data: {
        ...parsedData,
        url,
      },
    });
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

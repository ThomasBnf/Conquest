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
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useDebouncedCallback } from "use-debounce";
import { VariablePicker } from "../../pickers/variable-picker";
import { type FormUrl, FormUrlSchema } from "./form-url.schema";

export const WebhookOptions = () => {
  const { selected } = useSelected();
  const { setNodes } = useReactFlow();

  const { url, body } = NodeWebhookSchema.parse(selected?.data);

  const form = useForm<FormUrl>({
    resolver: zodResolver(FormUrlSchema),
    defaultValues: {
      url,
      body,
    },
  });

  const onSubmit = ({ url, body }: FormUrl) => {
    if (!selected) return;

    setNodes((nodes) =>
      nodes.map((node) =>
        node.id === selected.id
          ? { ...node, data: { ...node.data, url, body } }
          : node,
      ),
    );
  };

  const debouncedSubmit = useDebouncedCallback(
    (newBody: string) => onSubmit({ url, body: newBody }),
    500,
  );

  const onSetVariable = (variable: string) => {
    const newBody = (body ?? "") + variable;

    form.setValue("body", newBody);
    onSubmit({ url, body: newBody });
  };

  useEffect(() => {
    if (selected) {
      const { url, body } = NodeWebhookSchema.parse(selected.data);

      form.setValue("url", url);
      form.setValue("body", body);
    }
  }, [selected]);

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
                      onSubmit({ url: e.target.value, body });
                    }
                  }}
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
                    onChange={(e) => {
                      form.setValue("body", e.target.value);
                      debouncedSubmit(e.target.value);
                    }}
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

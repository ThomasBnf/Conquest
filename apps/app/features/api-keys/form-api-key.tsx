"use client";

import { createApiKey } from "@/actions/api-keys/actions/createApiKey";
import { Button } from "@conquest/ui/button";
import { Form, FormControl, FormField, FormItem } from "@conquest/ui/form";
import { Input } from "@conquest/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { type FormApiKey, FormApiKeySchema } from "./schema/form.schema";

export const FormAPIKey = () => {
  const form = useForm<FormApiKey>({
    resolver: zodResolver(FormApiKeySchema),
    defaultValues: {
      name: "",
    },
  });

  const loading = form.formState.isSubmitting;
  const disabled = !form.formState.isValid;

  const onSubmit = async ({ name }: FormApiKey) => {
    await createApiKey({ name });
    form.reset();
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex items-center justify-between gap-2"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="w-96">
              <FormControl>
                <Input
                  placeholder="API Key name"
                  className="h-8 max-w-sm"
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <Button type="submit" loading={loading} disabled={disabled}>
          New API{" "}
        </Button>
      </form>
    </Form>
  );
};

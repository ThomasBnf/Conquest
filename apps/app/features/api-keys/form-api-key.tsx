"use client";

import { trpc } from "@/server/client";
import { Button } from "@conquest/ui/button";
import { Form, FormControl, FormField, FormItem } from "@conquest/ui/form";
import { Input } from "@conquest/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { type FormCreate, FormCreateSchema } from "./schema/form-create.schema";
import { Loader2 } from "lucide-react";

export const FormAPIKey = () => {
  const utils = trpc.useUtils();
  const { mutateAsync } = trpc.apiKeys.post.useMutation({
    onSuccess: () => utils.apiKeys.list.invalidate(),
  });

  const form = useForm<FormCreate>({
    resolver: zodResolver(FormCreateSchema),
    defaultValues: {
      name: "",
    },
  });

  const loading = form.formState.isSubmitting;
  const disabled = !form.formState.isValid;

  const onSubmit = async ({ name }: FormCreate) => {
    await mutateAsync({ name });
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
        <Button type="submit" disabled={disabled}>
          {loading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            "New API Key"
          )}
        </Button>
      </form>
    </Form>
  );
};

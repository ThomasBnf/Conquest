"use client";

import { updateUser } from "@/actions/users/updateUser";
import { Button } from "@conquest/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@conquest/ui/form";
import { Input } from "@conquest/ui/input";
import type { UserWithWorkspace } from "@conquest/zod/schemas/user.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { FormUserSchema } from "./schema/form.schema";

type Props = {
  user: UserWithWorkspace;
};

export const FormUser = ({ user }: Props) => {
  const [loading, setLoading] = useState(false);

  const form = useForm<FormUserSchema>({
    resolver: zodResolver(FormUserSchema),
    defaultValues: {
      first_name: user.first_name ?? "",
      last_name: user.last_name ?? "",
      email: user.email,
    },
  });

  const onSubmit = async (values: FormUserSchema) => {
    setLoading(true);

    const updatedUser = await updateUser(values);

    const error = updatedUser?.serverError;

    if (error) {
      toast.error(error);
    } else {
      toast.success("Profile updated");
    }

    setLoading(false);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="first_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>First name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="last_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Last name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" loading={loading} disabled={loading}>
          Save
        </Button>
      </form>
    </Form>
  );
};

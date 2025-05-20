"use client";

import { trpc } from "@/server/client";
import { Button } from "@conquest/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@conquest/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@conquest/ui/form";
import { Input } from "@conquest/ui/input";
import { Skeleton } from "@conquest/ui/skeleton";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { FormUserSchema } from "./schema/form.schema";

export const FormUser = () => {
  const { data: user, isLoading } = trpc.users.getCurrentUser.useQuery();
  const [loading, setLoading] = useState(false);

  const { mutateAsync } = trpc.users.update.useMutation({
    onSuccess: () => {
      toast.success("Profile updated");
    },
    onError: (error) => {
      toast.error(error.message);
    },
    onSettled: () => {
      setLoading(false);
    },
  });

  const form = useForm<FormUserSchema>({
    resolver: zodResolver(FormUserSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
    },
  });

  const onSubmit = async (data: FormUserSchema) => {
    if (!user) return;

    setLoading(true);
    await mutateAsync({ ...user, ...data });
  };

  useEffect(() => {
    form.reset({
      firstName: user?.firstName ?? "",
      lastName: user?.lastName ?? "",
      email: user?.email ?? "",
    });
  }, [user]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Informations</CardTitle>
      </CardHeader>
      <CardContent className="mb-0.5">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    {isLoading ? (
                      <Skeleton className="h-9" />
                    ) : (
                      <Input {...field} />
                    )}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    {isLoading ? (
                      <Skeleton className="h-9" />
                    ) : (
                      <Input {...field} />
                    )}
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
                    {isLoading ? (
                      <Skeleton className="h-9" />
                    ) : (
                      <Input {...field} />
                    )}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={loading}>
              {loading ? <Loader2 className="size-4 animate-spin" /> : "Save"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

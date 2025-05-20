"use client";

import { trpc } from "@/server/client";
import { Button } from "@conquest/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@conquest/ui/card";
import { cn } from "@conquest/ui/cn";
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
import slugify from "@sindresorhus/slugify";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { FormWorkspaceSchema } from "./schema/form.schema";

export const FormWorkspace = () => {
  const { data: workspace, isLoading } = trpc.workspaces.get.useQuery();
  const [loading, setLoading] = useState(false);
  const [focus, setFocus] = useState(false);

  const { mutateAsync } = trpc.workspaces.update.useMutation({
    onSuccess: () => {
      setLoading(false);
      toast.success("Workspace updated");
    },
    onError: (error) => {
      toast.error(error.message);
      setLoading(false);
      form.setError("slug", { message: error.message });
    },
  });

  const form = useForm<FormWorkspaceSchema>({
    resolver: zodResolver(FormWorkspaceSchema),
    defaultValues: {
      name: "",
      slug: "",
    },
  });

  const onSubmit = async (data: FormWorkspaceSchema) => {
    if (!workspace) return;

    setLoading(true);
    await mutateAsync({ ...workspace, ...data });
  };

  useEffect(() => {
    form.reset({
      name: workspace?.name ?? "",
      slug: workspace?.slug ?? "",
    });
  }, [workspace]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Informations</CardTitle>
      </CardHeader>
      <CardContent className="mb-0.5">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              name="name"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Workspace name</FormLabel>
                  <FormControl>
                    {isLoading ? (
                      <Skeleton className="h-9" />
                    ) : (
                      <Input
                        {...field}
                        placeholder="Acme"
                        onChange={(e) => {
                          field.onChange(e);
                          form.setValue(
                            "slug",
                            slugify(e.target.value, { decamelize: false }),
                          );
                        }}
                      />
                    )}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="slug"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Workspace URL</FormLabel>
                  <FormControl>
                    <div
                      className={cn(
                        "relative flex items-center overflow-hidden rounded-md border",
                        focus && "border-main-200 ring-2 ring-ring",
                      )}
                    >
                      <p className="h-9 place-content-center border-r bg-muted px-3">
                        useconquest.com
                      </p>
                      {isLoading ? (
                        <Skeleton className="h-9 w-full rounded-l-none" />
                      ) : (
                        <Input
                          {...field}
                          variant="transparent"
                          placeholder="acme"
                          onFocus={() => setFocus(true)}
                          onBlur={() => setFocus(false)}
                        />
                      )}
                    </div>
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

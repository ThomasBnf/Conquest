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
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useDebounce } from "use-debounce";
import { FormWorkspaceSchema } from "./schema/form.schema";

export const FormWorkspace = () => {
  const { data: workspace } = trpc.workspaces.get.useQuery();
  const [loading, setLoading] = useState(false);
  const [isFocus, setFocus] = useState(false);
  const utils = trpc.useUtils();

  const { mutateAsync } = trpc.workspaces.update.useMutation({
    onSuccess: () => {
      setLoading(false);
      utils.workspaces.get.invalidate();
      utils.workspaces.getSlug.invalidate();
      toast.success("Workspace updated");
    },
    onError: (error) => {
      toast.error(error.message);
      setLoading(false);
    },
  });

  const form = useForm<FormWorkspaceSchema>({
    resolver: zodResolver(FormWorkspaceSchema),
    defaultValues: {
      name: workspace?.name ?? "",
      slug: workspace?.slug ?? "",
    },
    mode: "onChange",
  });

  const currentSlug = form.watch("slug");
  const [debouncedSlug] = useDebounce(currentSlug, 500);
  const {
    data: slugCount,
    isLoading: isSlugChecking,
    isFetched,
  } = trpc.workspaces.getSlug.useQuery(
    { slug: debouncedSlug },
    { enabled: Boolean(debouncedSlug) },
  );

  const isSlugTaken =
    slugCount && slugCount > 0 && currentSlug !== workspace?.slug;

  useEffect(() => {
    if (!currentSlug) return;

    if (isSlugTaken) {
      form.setError("slug", { message: "Slug already taken" });
    } else if (isFetched && debouncedSlug === currentSlug) {
      form.clearErrors("slug");
    }
  }, [isSlugTaken, currentSlug, debouncedSlug, isFetched, form]);

  const onSubmit = async (data: FormWorkspaceSchema) => {
    if (!workspace || isSlugTaken) return;

    setLoading(true);
    await mutateAsync({ ...workspace, ...data });
  };

  const generateSlugFromName = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

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
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        if (
                          !form.getValues("slug") ||
                          form.getValues("slug") ===
                            generateSlugFromName(field.value)
                        ) {
                          const newSlug = generateSlugFromName(e.target.value);
                          form.setValue("slug", newSlug, {
                            shouldValidate: true,
                          });
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug</FormLabel>
                  <FormControl>
                    <div
                      className={cn(
                        "relative flex items-center overflow-hidden rounded-md border",
                        isFocus && "border-main-200 ring-2 ring-ring",
                      )}
                    >
                      <p className="h-9 place-content-center border-r bg-muted px-3">
                        useconquest.com/
                      </p>
                      <Input
                        {...field}
                        variant="transparent"
                        placeholder="acme"
                        onFocus={() => setFocus(true)}
                        onBlur={() => setFocus(false)}
                      />
                      {isSlugChecking && (
                        <Loader2 className="absolute right-3 size-4 animate-spin text-muted-foreground" />
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              disabled={
                isSlugTaken ||
                isSlugChecking ||
                loading ||
                Object.keys(form.formState.errors).length > 0
              }
            >
              {loading ? <Loader2 className="size-4 animate-spin" /> : "Save"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

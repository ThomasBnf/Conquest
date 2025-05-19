"use client";

import {
  Workspace,
  WorkspaceSchema,
} from "@/features/onboarding/schemas/workspace-form.schema";
import { StepsIndicator } from "@/features/onboarding/steps-indicator";
import { trpc } from "@/server/client";
import { Button } from "@conquest/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@conquest/ui/card";
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
import slugify from "@sindresorhus/slugify";
import { ArrowRightIcon, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { cn } from "@conquest/ui/cn";

export default function Page() {
  const { data: session } = useSession();
  const { user } = session ?? {};

  const [loading, setLoading] = useState(false);
  const [focus, setFocus] = useState(false);
  const router = useRouter();

  const { mutateAsync: mutateWorkspace } = trpc.workspaces.update.useMutation({
    onMutate: () => {
      setLoading(true);
    },
    onSuccess: () => {
      router.push("/questions");
    },
    onError: (error) => {
      setLoading(false);
      form.setError("slug", { message: error.message });
    },
  });

  const form = useForm<Workspace>({
    resolver: zodResolver(WorkspaceSchema),
  });

  const onSubmit = async ({ name, slug }: Workspace) => {
    if (!user) return;

    const formattedSlug = slugify(slug, { decamelize: false });

    await mutateWorkspace({
      id: user.workspaceId,
      name: name.charAt(0).toUpperCase() + name.slice(1),
      slug: formattedSlug,
    });
  };

  return (
    <>
      <Card className="mx-auto w-full max-w-lg">
        <CardHeader>
          <CardTitle>Create your workspace</CardTitle>
          <CardDescription>
            Workspaces are shared environments where team can work together.
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <FormField
                name="name"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Workspace name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        autoFocus
                        placeholder="Acme"
                        onChange={(e) => {
                          field.onChange(e);
                          form.setValue(
                            "slug",
                            slugify(e.target.value, { decamelize: false }),
                          );
                        }}
                      />
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
                        <Input
                          {...field}
                          variant="transparent"
                          placeholder="acme"
                          onFocus={() => setFocus(true)}
                          onBlur={() => setFocus(false)}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <>
                    Next
                    <ArrowRightIcon size={16} />
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
      <StepsIndicator step={2} />
    </>
  );
}

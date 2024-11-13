"use client";

import { useUser } from "@/context/userContext";
import { installDiscourse } from "@/features/discourse/actions/installDiscourse";
import {
  type DiscourseAPI,
  DiscourseAPISchema,
} from "@/features/discourse/schemas/discourseAPI";
import { upsertIntegration } from "@/features/integrations/actions/upsertIntegration";
import { Button, buttonVariants } from "@conquest/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@conquest/ui/form";
import { Input } from "@conquest/ui/input";
import { Separator } from "@conquest/ui/separator";
import { cn } from "@conquest/ui/utils/cn";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ExternalLink } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export default function Page() {
  const { user, slug, discourse } = useUser();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const form = useForm<DiscourseAPI>({
    resolver: zodResolver(DiscourseAPISchema),
    defaultValues: {
      apiKey: "",
    },
  });

  const onUninstall = async () => {
    if (!discourse?.id) return;
    setLoading(true);

    setLoading(false);
    return toast.success("Discourse disconnected");
  };

  const onInstall = async ({ apiKey }: DiscourseAPI) => {
    setLoading(true);

    const rIntegration = await upsertIntegration({
      external_id: apiKey,
      status: "CONNECTED",
      details: {
        signature: "",
        source: "DISCOURSE",
        api_key: apiKey,
        score_config: {
          post: 10,
          reaction: 1,
          reply: 5,
          invite: 15,
        },
      },
    });
    const integration = rIntegration?.data;

    if (integration) {
      router.refresh();
      toast.success("Discourse connected");
    }
    setTimeout(() => {
      setLoading(false);
    }, 200);
  };

  const onTest = async () => {
    await installDiscourse();
  };

  return (
    <div className="mx-auto max-w-3xl py-16">
      <Link
        href={`/${slug}/settings/integrations`}
        className={cn(
          buttonVariants({ variant: "link", size: "xs" }),
          "flex w-fit items-center gap-1 text-foreground",
        )}
      >
        <ArrowLeft size={16} />
        <p>Integrations</p>
      </Link>
      <div className="mt-6 flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <div className="rounded-md border p-3">
            <Image
              src="/social/discourse.svg"
              alt="Discourse"
              width={24}
              height={24}
            />
          </div>
          <div>
            <p className="text-lg font-medium">Discourse</p>
            <p className="text-muted-foreground">
              Synchronize your members with Discourse
            </p>
          </div>
        </div>
        <div className="rounded-md border overflow-hidden">
          <div className="flex items-center justify-between p-4 bg-muted">
            <div className="flex items-center gap-4">
              <Link
                href="https://docs.useconquest.com/discourse"
                target="_blank"
                className={cn(
                  buttonVariants({ variant: "link", size: "xs" }),
                  "flex w-fit items-center gap-1 text-foreground",
                )}
              >
                <ExternalLink size={15} />
                <p>Documentation</p>
              </Link>
              <Link
                href="https://discourse.com"
                target="_blank"
                className={cn(
                  buttonVariants({ variant: "link", size: "xs" }),
                  "flex w-fit items-center gap-1 text-foreground",
                )}
              >
                <ExternalLink size={15} />
                discourse.com
              </Link>
            </div>
            <Button loading={loading} onClick={onTest}>
              test
            </Button>
            {discourse?.id && (
              <Button
                variant="destructive"
                loading={loading}
                onClick={onUninstall}
              >
                Uninstall
              </Button>
            )}
          </div>
          <Separator />
          <div className="p-4 space-y-6">
            {!discourse?.id && (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onInstall)}>
                  <FormField
                    control={form.control}
                    name="apiKey"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>API Key</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Your Discourse API Key"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    loading={loading}
                    disabled={!form.formState.isValid || loading}
                    className="mt-4"
                  >
                    Install
                  </Button>
                </form>
              </Form>
            )}
            <div>
              <p className="font-medium">Overview</p>
              <p className="text-muted-foreground">
                Discourse integration makes it easy to get messages, replies,
                reactions into Conquest, and send direct messages to your
                members via workflows
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useUser } from "@/context/userContext";
import {
  type DiscourseAPI,
  DiscourseAPISchema,
} from "@/features/discourse/schemas/discourseAPI";
import { deleteIntegration } from "@/features/integrations/actions/deleteIntegration";
import { upsertIntegration } from "@/features/integrations/actions/upsertIntegration";
import { PointConfig } from "@/features/integrations/components/point-config";
import { Button, buttonVariants } from "@conquest/ui/button";
import { Card, CardContent, CardHeader } from "@conquest/ui/card";
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
import { Separator } from "@conquest/ui/separator";
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
      community_url: "https://playground.lagrowthmachine.com",
      api_key:
        "a7e80919eecc82b71fe8a23d8d0e199bf3d593216835315133254de014e9e1b3",
    },
  });

  const onUninstall = async () => {
    if (!discourse?.id) return;
    setLoading(true);

    await deleteIntegration({
      source: "DISCOURSE",
      integration: discourse,
    });

    setLoading(false);
    return toast.success("Discourse disconnected");
  };

  const onInstall = async ({ api_key, community_url }: DiscourseAPI) => {
    setLoading(true);

    const rIntegration = await upsertIntegration({
      external_id: api_key,
      status: "CONNECTED",
      details: {
        community_url,
        signature: "",
        source: "DISCOURSE",
        api_key,
        points_config: {
          post: 10,
          reaction: 1,
          reply: 5,
          invitation: 15,
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
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
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
            {discourse?.id && (
              <Button
                variant="destructive"
                loading={loading}
                onClick={onUninstall}
              >
                Uninstall
              </Button>
            )}
          </CardHeader>
          <CardContent className="p-0 mb-0.5">
            <div className="p-4">
              <p className="font-medium text-base">Overview</p>
              <p className="text-muted-foreground text-balance">
                Connect your Discourse workspace to automatically sync messages,
                collect member interactions, and send personalized direct
                messages through automated workflows.
              </p>
            </div>
            {!discourse?.id && (
              <>
                <Separator />
                <div className="p-4 space-y-6">
                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit(onInstall)}
                      className="space-y-6"
                    >
                      <FormField
                        control={form.control}
                        name="community_url"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Community URL</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Your Discourse community URL"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="api_key"
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
                </div>
              </>
            )}
            {discourse?.id && (
              <>
                <Separator />
                <PointConfig integration={discourse} />
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import { useUser } from "@/context/userContext";
import type { installDiscourse } from "@/trigger/installDiscourse.trigger";
import { Button } from "@conquest/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@conquest/ui/form";
import { Input } from "@conquest/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRealtimeTaskTrigger } from "@trigger.dev/react-hooks";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  type FormDiscourse,
  FormDiscourseSchema,
} from "./schemas/form-discourse.schema";

export const InstallForm = () => {
  const { discourse } = useUser();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const { submit, run } = useRealtimeTaskTrigger<typeof installDiscourse>(
    "install-discourse",
    {
      accessToken: discourse?.trigger_token,
    },
  );

  const form = useForm<FormDiscourse>({
    resolver: zodResolver(FormDiscourseSchema),
    defaultValues: {
      community_url: "https://playground.lagrowthmachine.com",
      api_key:
        "a7e80919eecc82b71fe8a23d8d0e199bf3d593216835315133254de014e9e1b3",
    },
  });

  const onSubmit = async ({ community_url, api_key }: FormDiscourse) => {
    if (!discourse) return;
    setLoading(true);
    const formattedCommunityUrl = community_url.trim().replace(/\/$/, "");
    submit({ discourse, community_url: formattedCommunityUrl, api_key });
  };

  useEffect(() => {
    if (!run?.status) return;

    const isCompleted = run.status === "COMPLETED";
    const isFailed = run.status === "FAILED";

    if (isCompleted || isFailed) {
      setLoading(false);

      if (isFailed) {
        toast.error("Failed to install Slack", { duration: 5000 });
      }

      router.refresh();
    }
  }, [run]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-4">
        <FormField
          control={form.control}
          name="community_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Community URL</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>
                This is your public Discourse community URL.
              </FormDescription>
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
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" loading={loading} disabled={loading}>
          Install
        </Button>
      </form>
    </Form>
  );
};

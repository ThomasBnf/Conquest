import { useUser } from "@/context/userContext";
import type { installLivestorm } from "@/trigger/installLivestorm.trigger.js";
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
import { zodResolver } from "@hookform/resolvers/zod";
import { useRealtimeTaskTrigger } from "@trigger.dev/react-hooks";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  type FormLivestorm,
  FormLivestormSchema,
} from "./schemas/form-discourse.schema";

export const InstallForm = () => {
  const { livestorm } = useUser();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const { submit, run } = useRealtimeTaskTrigger<typeof installLivestorm>(
    "install-livestorm",
    {
      accessToken: livestorm?.trigger_token,
    },
  );

  const form = useForm<FormLivestorm>({
    resolver: zodResolver(FormLivestormSchema),
    defaultValues: {
      api_key:
        "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJhcGkubGl2ZXN0b3JtLmNvIiwianRpIjoiYjkyNGEzMTktYmY3NC00ZjczLTk5YWUtNzY4MTk0NDY0YTFjIiwiaWF0IjoxNzM0MjgyODI2LCJvcmciOiI3Y2E5YzZlNy0wOGU4LTRlNjQtOTkyZC05ODBlOTExZDQ3NmUifQ.oMYnetgNdbO189pstVjO_sTtxmi0oDS1wd688FsRFW8",
    },
  });

  const onSubmit = ({ api_key }: FormLivestorm) => {
    if (!livestorm) return;
    setLoading(true);
    submit({ integration: livestorm, api_key });
  };

  useEffect(() => {
    if (!run?.status) return;

    console.dir(run, { depth: Number.POSITIVE_INFINITY });

    const isCompleted = run.status === "COMPLETED";
    const isFailed = run.status === "FAILED";

    if (isCompleted || isFailed) {
      setLoading(false);
      router.refresh();

      if (isFailed) {
        toast.error("Failed to install Slack", { duration: 5000 });
      }
    }
  }, [run]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-4">
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

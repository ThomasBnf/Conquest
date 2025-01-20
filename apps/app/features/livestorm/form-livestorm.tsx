import { listLivestormOrganization } from "@/client/livestorm/listLivestormOrganization";
import { useUser } from "@/context/userContext";
import type { installLivestorm } from "@/trigger/installLivestorm.trigger";
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
import { Separator } from "@conquest/ui/separator";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRealtimeTaskTrigger } from "@trigger.dev/react-hooks";
import { useRouter } from "next/navigation";
import { type Dispatch, type SetStateAction, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { LoadingMessage } from "../integrations/loading-message";
import { type FormFilter, FormFilterSchema } from "./schemas/form.schema";

type Props = {
  loading: boolean;
  setLoading: Dispatch<SetStateAction<boolean>>;
};

export const FormLivestorm = ({ loading, setLoading }: Props) => {
  const { livestorm } = useUser();
  const router = useRouter();

  const { submit, run } = useRealtimeTaskTrigger<typeof installLivestorm>(
    "install-livestorm",
    { accessToken: livestorm?.trigger_token },
  );

  const { organization } = listLivestormOrganization();

  const form = useForm<FormFilter>({
    resolver: zodResolver(FormFilterSchema),
  });

  const onSubmit = async ({ filter }: FormFilter) => {
    if (!livestorm) return;
    const { included } = organization ?? {};

    setLoading(true);

    const organization_id = included?.at(0)?.id ?? "";
    const organization_name = included?.at(0)?.attributes.name ?? "";

    submit({ livestorm, organization_id, organization_name, filter });
  };

  useEffect(() => {
    if (!run?.status) return;

    const isCompleted = run.status === "COMPLETED";
    const isFailed = run.status === "FAILED";

    if (isFailed) {
      router.refresh();
      toast.error("Failed to install Livestorm", { duration: 5000 });
    }

    if (isCompleted) router.refresh();
  }, [run]);

  return (
    <>
      <Separator className="my-4" />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="filter"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Filter</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Community Event"
                    disabled={loading}
                  />
                </FormControl>
                <FormDescription>
                  Filters your Livestorm events by title. eg: "Community Event"
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          {loading && <LoadingMessage />}
          <Button loading={loading} disabled={loading}>
            Let's start!
          </Button>
        </form>
      </Form>
    </>
  );
};

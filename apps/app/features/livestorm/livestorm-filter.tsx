import { LIVESTORM_ACTIVITY_TYPES } from "@/constant";
import { useIntegration } from "@/context/integrationContext";
import { trpc } from "@/server/client";
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
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { type FormCreate, FormCreateSchema } from "./schemas/form.schema";

export const LivestormFilter = () => {
  const { livestorm, setLoading, loading, setStep } = useIntegration();
  const utils = trpc.useUtils();

  const { data: organization, failureReason } =
    trpc.livestorm.getOrganization.useQuery();
  const { mutateAsync } = trpc.integrations.updateIntegration.useMutation({
    onSuccess: () => {
      utils.integrations.getIntegrationBySource.invalidate({
        source: "LIVESTORM",
      });
    },
  });

  console.log("failureReason", failureReason);

  const { mutateAsync: createManyActivityTypes } =
    trpc.activityTypes.createManyActivityTypes.useMutation({
      onSuccess: () => {
        utils.activityTypes.getAllActivityTypes.invalidate();
        setTimeout(() => {
          setLoading(false);
          setStep(1);
        }, 300);
      },
    });

  const form = useForm<FormCreate>({
    resolver: zodResolver(FormCreateSchema),
  });

  const onSubmit = async ({ filter }: FormCreate) => {
    if (!livestorm) return;
    setLoading(true);

    const { included } = organization ?? {};
    const organization_id = included?.at(0)?.id ?? "";
    const organization_name = included?.at(0)?.attributes.name ?? "";

    await mutateAsync({
      id: livestorm.id,
      external_id: organization_id,
      details: {
        ...livestorm.details,
        name: organization_name,
        filter,
      },
    });

    await createManyActivityTypes({ activity_types: LIVESTORM_ACTIVITY_TYPES });
  };

  useEffect(() => {
    if (livestorm?.details.name) setStep(1);
  }, [livestorm]);

  return (
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
                Filter your Livestorm events by title. eg: "Community Event"
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" loading={loading} disabled={loading}>
          Next
        </Button>
      </form>
    </Form>
  );
};

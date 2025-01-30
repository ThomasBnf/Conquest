import { updateIntegration } from "@/actions/integrations/updateIntegration";
import { IconDoc } from "@/components/custom/icon-doc";
import { useUser } from "@/context/userContext";
import type { installDiscourse } from "@conquest/trigger/tasks/installDiscourse.trigger";
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
import { Label } from "@conquest/ui/label";
import { Separator } from "@conquest/ui/separator";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRealtimeTaskTrigger } from "@trigger.dev/react-hooks";
import cuid from "cuid";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { type Dispatch, type SetStateAction, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { LoadingMessage } from "../integrations/loading-message";
import { DiscourseInstruction } from "./discourse-instruction";
import {
  type Field,
  type FormCreate,
  FormCreateSchema,
} from "./schemas/form-create";
import { UserFields } from "./user-fields";

type Props = {
  loading: boolean;
  setLoading: Dispatch<SetStateAction<boolean>>;
};

export const DiscourseForm = ({ loading, setLoading }: Props) => {
  const { discourse } = useUser();
  const [fields, setFields] = useState<Field[]>([]);
  const router = useRouter();

  const { submit, run, error } = useRealtimeTaskTrigger<
    typeof installDiscourse
  >("install-discourse", { accessToken: discourse?.trigger_token });

  const form = useForm<FormCreate>({
    resolver: zodResolver(FormCreateSchema),
  });

  const onSubmit = async ({ community_url, api_key }: FormCreate) => {
    if (!discourse) return;

    setLoading(true);

    const formattedCommunityUrl = community_url.trim().replace(/\/$/, "");

    await updateIntegration({
      id: discourse.id,
      details: {
        source: "DISCOURSE",
        community_url: formattedCommunityUrl,
        api_key,
        user_fields: fields.map((field) => ({
          id: field.external_id,
          name: field.name,
        })),
      },
      status: "SYNCING",
    });

    submit({ discourse });
  };

  const onAddField = () => {
    const newField = { id: cuid(), external_id: "", name: "" };
    setFields((prev) => [...prev, newField]);
  };

  const onRemoveField = (id: string) => {
    setFields((prev) => prev.filter((field) => field.id !== id));
  };

  const onChangeField = (
    id: string,
    key: "external_id" | "name",
    value: string,
  ) => {
    setFields((prev) =>
      prev.map((field) =>
        field.id === id ? { ...field, [key]: value } : field,
      ),
    );
  };

  useEffect(() => {
    if (!run?.status) return;

    const isCompleted = run.status === "COMPLETED";
    const isFailed = run.status === "FAILED";

    if (isFailed || error) {
      router.refresh();
      toast.error("Failed to install Discourse", { duration: 5000 });
      setLoading(false);
    }

    if (isCompleted) router.refresh();
  }, [run]);

  return (
    <>
      <Separator className="my-4" />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col gap-4">
            <div>
              <p className="font-medium text-base">API Configuration</p>
              <p className="text-muted-foreground">
                You can find your API keys in the Discourse Admin panel.
              </p>
            </div>
            <FormField
              control={form.control}
              name="community_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Community URL</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={loading}
                      placeholder="https://conquest.discourse.group"
                    />
                  </FormControl>
                  <FormDescription>
                    Your Discourse community URL. eg:
                    <span className="ml-1 rounded border bg-muted px-1 py-0.5 text-foreground">
                      https://conquest.discourse.group
                    </span>
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
                    <Input
                      {...field}
                      disabled={loading}
                      placeholder="b4f92c38d15a76e9f3c1a4b5d2e8x7y6p9m4n2q1r8t3v5w7h9j6k4l8s2u4v7"
                    />
                  </FormControl>
                  <FormDescription>
                    <span className="rounded border bg-muted px-1 py-0.5 text-foreground">
                      Admin {">"} Advanced {">"} API Keys {">"} New API Key{" "}
                      {">"}
                      User Level: "All users" {">"} Scope: "Read Only"
                    </span>
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex flex-col gap-2">
              <Label className="flex items-center gap-2">
                User Fields (optional){" "}
                <IconDoc url="https://docs.useconquest.com/integrations/discourse#param-user-fields" />
              </Label>
              {fields.length > 0 && (
                <UserFields
                  fields={fields}
                  onRemoveField={onRemoveField}
                  onChangeField={onChangeField}
                  disabled={loading}
                />
              )}
              <Button
                type="button"
                variant="outline"
                className="w-fit"
                disabled={loading}
                onClick={onAddField}
              >
                <Plus size={16} />
                Add field
              </Button>
            </div>
          </div>
          <div className="mt-2 flex flex-col gap-4">
            <div>
              <p className="font-medium text-base">Webhook Configuration</p>
              <p className="text-muted-foreground">
                You can find your Webhooks in the Discourse Admin panel.
              </p>
              <p className="mt-1 w-fit rounded border bg-muted px-1 py-0.5">
                Admin {">"} Advanced {">"} Webhooks {">"} Add Webhook
              </p>
            </div>
            <div className="space-y-2">
              <FormField
                control={form.control}
                name="payload_url"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <DiscourseInstruction
                        title="Payload URL"
                        text="I have copied, pasted the Payload URL"
                        toCopy="https://app.useconquest.com/api/discourse"
                        value={field.value}
                        disabled={loading}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="content_type"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <DiscourseInstruction
                        title="Content Type"
                        text={`I have selected "application/json"`}
                        value={field.value}
                        disabled={loading}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="secret"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <DiscourseInstruction
                        title="Secret"
                        text="I have copied, pasted the secret key"
                        toCopy="5771586e347bcbf533f83f14cd2bea6afab412d068bb9cb2e34152bdc3c01f7f"
                        value={field.value}
                        disabled={loading}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="send_me_everything"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <DiscourseInstruction
                        title="Send me everything"
                        text={`I have selected "Send me everything" Webhook events`}
                        value={field.value}
                        disabled={loading}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          {loading ? (
            <LoadingMessage />
          ) : (
            <Button
              type="submit"
              className="w-fit"
              disabled={!form.formState.isValid || loading}
            >
              Let's start !
            </Button>
          )}
        </form>
      </Form>
    </>
  );
};

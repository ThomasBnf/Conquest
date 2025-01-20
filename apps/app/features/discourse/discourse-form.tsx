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
import { Instruction } from "./instruction";
import {
  type Field,
  type FormDiscourse,
  FormDiscourseSchema,
} from "./schemas/form-discourse.schema";
import { UserFields } from "./user-fields";

type Props = {
  loading: boolean;
  setLoading: Dispatch<SetStateAction<boolean>>;
};

export const DiscourseForm = ({ loading, setLoading }: Props) => {
  const { discourse } = useUser();
  const [fields, setFields] = useState<Field[]>([
    // { id: "1234", external_id: "12", name: "Company" },
    // { id: "1235", external_id: "13", name: "Linkedin Profile" },
    // { id: "1236", external_id: "8", name: "Language" },
    // { id: "1237", external_id: "11", name: "Sell services" },
    // { id: "1238", external_id: "3", name: "Need VS Expertise" },
  ]);
  const router = useRouter();

  const { submit, run, error } = useRealtimeTaskTrigger<
    typeof installDiscourse
  >("install-discourse", { accessToken: discourse?.trigger_token });

  const form = useForm<FormDiscourse>({
    resolver: zodResolver(FormDiscourseSchema),
    // defaultValues: {
    //   community_url: "https://playground.lagrowthmachine.com",
    //   api_key:
    //     "a7e80919eecc82b71fe8a23d8d0e199bf3d593216835315133254de014e9e1b3",
    //   payload_url: true,
    //   content_type: true,
    //   secret: true,
    //   send_me_everything: true,
    // },
  });

  const onSubmit = async ({ community_url, api_key }: FormDiscourse) => {
    if (!discourse) return;

    setLoading(true);

    const formattedCommunityUrl = community_url.trim().replace(/\/$/, "");

    submit({
      discourse,
      community_url: formattedCommunityUrl,
      api_key,
      user_fields: fields.map((field) => ({
        id: field.external_id,
        name: field.name,
      })),
    });
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
                      placeholder="a7e80919eecc82b71fe8a23d8d0e199bf3d593216835315133254de014e9e1b3"
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
              <Label>User Fields</Label>
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
                <Plus size={15} />
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
                      <Instruction
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
                      <Instruction
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
                      <Instruction
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
                      <Instruction
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
          {loading && <LoadingMessage />}
          <Button
            type="submit"
            className="w-fit"
            loading={loading}
            disabled={!form.formState.isValid || loading}
          >
            Let's start !
          </Button>
        </form>
      </Form>
    </>
  );
};

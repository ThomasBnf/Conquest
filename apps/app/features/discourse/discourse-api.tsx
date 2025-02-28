import { IconDoc } from "@/components/custom/icon-doc";
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
import { Label } from "@conquest/ui/label";
import { zodResolver } from "@hookform/resolvers/zod";
import { v4 as uuid } from "uuid";
import { ArrowRight, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { DiscourseInstruction } from "./discourse-instruction";
import {
  type Field,
  type FormCreate,
  FormCreateSchema,
} from "./schemas/form-create";
import { UserFields } from "./user-fields";

export const DiscourseApi = () => {
  const { discourse, loading, setLoading, setStep } = useIntegration();
  const [fields, setFields] = useState<Field[]>([
    {
      id: "cm73gke9v00003b6wntfv5bui",
      external_id: "12",
      name: "Company",
    },
    {
      id: "cm73gkemq00013b6wjug54cd9",
      external_id: "13",
      name: "Linkedin",
    },
    {
      id: "cm73gkf5o00023b6wl5go619q",
      external_id: "8",
      name: "Language",
    },
    {
      id: "cm73gkffb00033b6wusl8sru1",
      external_id: "11",
      name: "Sell services",
    },
    {
      id: "cm73gkg0y00043b6w9pa94c48",
      external_id: "3",
      name: "Need Vs Expertise",
    },
  ]);

  const { mutateAsync: updateIntegration } =
    trpc.integrations.update.useMutation({
      onSuccess: () => {
        setStep(1);
        setLoading(false);
      },
    });

  const form = useForm<FormCreate>({
    resolver: zodResolver(FormCreateSchema),
    defaultValues: {
      community_url: "https://playground.lagrowthmachine.com/",
      api_key:
        "a7e80919eecc82b71fe8a23d8d0e199bf3d593216835315133254de014e9e1b3",
      content_type: true,
      payload_url: true,
      secret: true,
      send_me_everything: true,
    },
  });

  const onSubmit = async ({ community_url, api_key }: FormCreate) => {
    if (!discourse) return;

    setLoading(true);

    const formattedCommunityUrl = community_url.trim().replace(/\/$/, "");

    await updateIntegration({
      id: discourse.id,
      details: {
        ...discourse.details,
        api_key,
        community_url: formattedCommunityUrl,
        user_fields: fields.map((field) => ({
          id: field.external_id,
          name: field.name,
        })),
      },
    });
  };

  const onAddField = () => {
    const newField = { id: uuid(), external_id: "", name: "" };
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
    if (discourse?.details?.community_url) setStep(1);
  }, [discourse]);

  return (
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
                    Admin {">"} Advanced {">"} API Keys {">"} New API Key {">"}
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
                      toCopy="https://app.useconquest.com/webhook/discourse"
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
        <Button loading={loading} disabled={loading} className="w-fit">
          Next
          <ArrowRight size={16} />
        </Button>
      </form>
    </Form>
  );
};

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@conquest/ui/form";
import { Input } from "@conquest/ui/input";
import type { Integration } from "@conquest/zod/integration.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { updateIntegration } from "../actions/updateIntegration";
import {
  type FormPointConfig,
  FormPointConfigSchema,
} from "../schemas/form-point-config";
type Props = {
  integration: Integration;
};

export const PointConfig = ({ integration }: Props) => {
  const [loading, setLoading] = useState(false);

  const { post, reply, reaction, invitation } =
    integration.details.points_config;

  const form = useForm<FormPointConfig>({
    resolver: zodResolver(FormPointConfigSchema),
    defaultValues: {
      post,
      reply,
      reaction,
      invitation,
    },
  });

  const onSubmit = async ({
    post,
    reply,
    reaction,
    invitation,
  }: FormPointConfig) => {
    setLoading(true);

    const rIntegration = await updateIntegration({
      integration,
      post,
      reply,
      reaction,
      invitation,
    });
    const error = rIntegration?.serverError;

    if (error) {
      toast.error(error);
      setLoading(false);
      return;
    }

    toast.success("Points configuration updated");
    setLoading(false);
  };

  return (
    <Form {...form}>
      <form>
        <div className="p-4">
          <p className="font-medium text-base">Points</p>
          <p className="text-muted-foreground text-balance">
            Personalize activity points based on your team&apos;s needs.
          </p>
          <div className="flex flex-col gap-4 mt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Post</p>
                <p className="text-muted-foreground">
                  Set the points when a member post a new message on public
                  channel.
                </p>
              </div>
              <FormField
                control={form.control}
                name="post"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        {...field}
                        onBlur={() => form.handleSubmit(onSubmit)()}
                        className="w-16 text-end"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Reply</p>
                <p className="text-muted-foreground">
                  Set the points when a member reply to a post.
                </p>
              </div>
              <FormField
                control={form.control}
                name="reply"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        {...field}
                        onBlur={() => form.handleSubmit(onSubmit)()}
                        className="w-16 text-end"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Reaction</p>
                <p className="text-muted-foreground">
                  Set the points when a member react to a post or reply.
                </p>
              </div>
              <FormField
                control={form.control}
                name="reaction"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        {...field}
                        onBlur={() => form.handleSubmit(onSubmit)()}
                        className="w-16 text-end"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Invitation</p>
                <p className="text-muted-foreground">
                  Set the points when a member sends an invitation to join the
                  workspace.
                </p>
              </div>
              <FormField
                control={form.control}
                name="invitation"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        {...field}
                        onBlur={() => form.handleSubmit(onSubmit)()}
                        className="w-16 text-end"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
};

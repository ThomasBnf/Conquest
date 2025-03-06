"use client";

import { Button } from "@conquest/ui/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@conquest/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@conquest/ui/form";
import { Input } from "@conquest/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@conquest/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { type FormWebhook, FormWebhookSchema } from "./schema/form.schema";

export const WebhookForm = () => {
  const form = useForm<FormWebhook>({
    resolver: zodResolver(FormWebhookSchema),
    defaultValues: {
      trigger: "",
      url: "",
      secret: "",
    },
  });

  const loading = form.formState.isSubmitting;
  const disabled = !form.formState.isValid;

  const onSubmit = async ({ trigger, url, secret }: FormWebhook) => {
    // await createWebhook({ trigger, url, secret });
    form.reset();
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="w-fit">New Webhook</Button>
      </DialogTrigger>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Webhook</DialogTitle>
            </DialogHeader>
            <DialogBody>
              <FormField
                control={form.control}
                name="trigger"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Trigger</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select trigger" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="member_created">
                            Member created
                          </SelectItem>
                          <SelectItem value="member_updated">
                            Member updated
                          </SelectItem>
                          <SelectItem value="member_deleted">
                            Member deleted
                          </SelectItem>
                          <SelectItem value="member_reached_new_level">
                            Member has reached new level
                          </SelectItem>
                          <SelectItem value="member_lost_level">
                            Member has lost level
                          </SelectItem>
                          <SelectItem value="activity_created">
                            Activity created
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="trigger"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL</FormLabel>
                    <FormControl>
                      <Input placeholder="Webhook URL" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="secret"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Secret</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </DialogBody>
            <DialogFooter>
              <DialogTrigger asChild>
                <Button variant="outline">Cancel</Button>
              </DialogTrigger>
              <Button type="submit" disabled={disabled}>
                {loading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  "Create Webhook"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </form>
      </Form>
    </Dialog>
  );
};

"use client";

import { trpc } from "@/server/client";
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
  FormMessage,
} from "@conquest/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@conquest/ui/select";
import { TextField } from "@conquest/ui/text-field";
import type { Member } from "@conquest/zod/schemas/member.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { type FormCreate, FormCreateSchema } from "./schemas/form.schema";

type Props = {
  member: Member;
};

export const CreateActivityDialog = ({ member }: Props) => {
  const [open, setOpen] = useState(false);
  const utils = trpc.useUtils();

  const { data } = trpc.activityTypes.getAllActivityTypes.useQuery();
  const { mutateAsync, isPending } = trpc.activities.createActivity.useMutation(
    {
      onSuccess: () => {
        utils.activities.getMemberActivities.invalidate();
        setOpen(false);
        form.reset();
      },
    },
  );

  const activityTypes = data?.filter(
    (activityType) => activityType.source === "MANUAL",
  );

  const form = useForm<FormCreate>({
    resolver: zodResolver(FormCreateSchema),
    defaultValues: {
      member_id: member.id,
    },
  });

  const onSubmit = async (values: FormCreate) => {
    await mutateAsync(values);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add activity</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add new activity</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogBody>
              <FormField
                control={form.control}
                name="activity_type_key"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Activity type</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={(value) => field.onChange(value)}
                        value={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select activity type" />
                        </SelectTrigger>
                        <SelectContent>
                          {activityTypes && activityTypes?.length > 0 ? (
                            activityTypes?.map((activity_type) => (
                              <SelectItem
                                key={activity_type.key}
                                value={activity_type.key}
                              >
                                {activity_type.key}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="empty" disabled>
                              No activity types
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Message</FormLabel>
                    <FormControl>
                      <TextField {...field} placeholder="Add a message" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </DialogBody>
            <DialogFooter>
              <DialogTrigger asChild>
                <Button variant="outline">Cancel</Button>
              </DialogTrigger>
              <Button type="submit" loading={isPending} disabled={isPending}>
                Add activity
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

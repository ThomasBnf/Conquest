"use client";

import { createActivity } from "@/actions/activities/createActivity";
import { updateMemberMetrics } from "@/actions/members/updateMemberMetrics";
import { listActivityTypes } from "@/client/activity-types/listActivityTypes";
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
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@conquest/ui/select";
import { TextField } from "@conquest/ui/text-field";
import type { ActivityType } from "@conquest/zod/schemas/activity-type.schema";
import type { MemberWithCompany } from "@conquest/zod/schemas/member.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { type AddActivityForm, addActivitySchema } from "./schemas/form.schema";

type Props = {
  member: MemberWithCompany;
};

export const ActivityDialog = ({ member }: Props) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { data: activity_types } = listActivityTypes();
  const queryClient = useQueryClient();

  const form = useForm<AddActivityForm>({
    resolver: zodResolver(addActivitySchema),
  });

  const groupedActivityTypes = activity_types?.reduce<
    Array<{
      source: string;
      activity_types: ActivityType[];
    }>
  >((acc, activity_type) => {
    const existingGroup = acc.find(
      (group) => group.source === activity_type.source,
    );

    if (existingGroup) {
      existingGroup.activity_types.push(activity_type);
      return acc;
    }

    acc.push({
      source: activity_type.source,
      activity_types: [activity_type],
    });
    return acc;
  }, []);

  const onSubmit = async ({ activity_type_key, message }: AddActivityForm) => {
    setLoading(true);
    const activity = await createActivity({
      member_id: member.id,
      activity_type_key,
      message,
    });
    await updateMemberMetrics({ member_id: member.id });

    const error = activity?.serverError;

    if (error) toast.error(error);

    queryClient.invalidateQueries({
      queryKey: ["activities", member.id],
    });

    setOpen(false);
    setLoading(false);
    form.reset();
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
                          {groupedActivityTypes?.map((group) => (
                            <SelectGroup key={group.source}>
                              <SelectLabel>
                                {group.source.charAt(0).toUpperCase() +
                                  group.source.slice(1).toLowerCase()}
                              </SelectLabel>
                              {group.activity_types.map((activity_type) => (
                                <SelectItem
                                  key={activity_type.key}
                                  value={activity_type.key}
                                >
                                  {activity_type.name}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          ))}
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
              <Button type="submit" loading={loading} disabled={loading}>
                Add activity
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

"use client";

import { createActivity } from "@/actions/activities/createActivity";
import { useListActivityTypes } from "@/queries/hooks/useListActivityTypes";
import { Button } from "@conquest/ui/src/components/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@conquest/ui/src/components/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@conquest/ui/src/components/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@conquest/ui/src/components/select";
import { TextField } from "@conquest/ui/src/components/text-field";
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

export const AddActivityDialog = ({ member }: Props) => {
  const [open, setOpen] = useState(false);
  const { data: activity_types } = useListActivityTypes();
  const queryClient = useQueryClient();

  const form = useForm<AddActivityForm>({
    resolver: zodResolver(addActivitySchema),
    defaultValues: {
      message: "",
      activity_type_id: "",
    },
  });

  const onSubmit = async ({ activity_type_id, message }: AddActivityForm) => {
    const activity = await createActivity({
      member_id: member.id,
      activity_type_id,
      message,
    });

    const error = activity?.serverError;

    if (error) toast.error(error);

    queryClient.invalidateQueries({
      queryKey: ["activities", member.id],
    });
    setOpen(false);
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
                name="activity_type_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Activity type</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={(value) => field.onChange(value)}
                        value={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {activity_types?.map((activity_type) => (
                            <SelectItem
                              key={activity_type.id}
                              value={activity_type.id}
                            >
                              {activity_type.name}
                            </SelectItem>
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
                      <TextField {...field} />
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
              <Button type="submit">Add activity</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

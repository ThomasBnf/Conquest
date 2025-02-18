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
import { Input } from "@conquest/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { type MemberForm, MemberFormSchema } from "./schema/member-form.schema";

export const CreateMemberDialog = () => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const utils = trpc.useUtils();

  const { mutateAsync } = trpc.members.createMember.useMutation({
    onSuccess: () => {
      utils.members.getAllMembers.invalidate();
      utils.members.countMembers.invalidate();
      toast.success("Member created");
      form.reset();
    },
    onError: () => {
      toast.error("Failed to create member");
    },
    onSettled: () => {
      setOpen(false);
      setLoading(false);
    },
  });

  const form = useForm<MemberForm>({
    resolver: zodResolver(MemberFormSchema),
  });

  const onSubmit = async (values: MemberForm) => {
    setLoading(true);
    await mutateAsync(values);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus size={16} />
          Add Member
        </Button>
      </DialogTrigger>
      <DialogContent aria-describedby="dialog-description">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col"
          >
            <DialogHeader>
              <DialogTitle>Add Member</DialogTitle>
            </DialogHeader>
            <DialogBody>
              <FormField
                control={form.control}
                name="first_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Set First name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="last_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Set Last name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Set Email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </DialogBody>
            <DialogFooter>
              <DialogTrigger asChild>
                <Button variant="outline" disabled={loading}>
                  Cancel
                </Button>
              </DialogTrigger>
              <Button type="submit" loading={loading} disabled={loading}>
                Add Member
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

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
import { Loader2, Plus } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { type MemberForm, MemberFormSchema } from "./schema/member-form.schema";

export const CreateMemberDialog = () => {
  const { slug } = useParams();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const utils = trpc.useUtils();
  const router = useRouter();

  const { mutateAsync } = trpc.members.post.useMutation({
    onSuccess: ({ id }) => {
      utils.members.list.invalidate();
      utils.members.count.invalidate();
      router.push(`/${slug}/members/${id}/analytics`);
    },
    onError: () => {
      setOpen(false);
      setLoading(false);
      toast.error("Failed to create member");
    },
  });

  const form = useForm<MemberForm>({
    resolver: zodResolver(MemberFormSchema),
    defaultValues: {
      source: "Manual",
    },
  });

  const onSubmit = async (data: MemberForm) => {
    setLoading(true);
    await mutateAsync(data);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus size={16} />
          New
        </Button>
      </DialogTrigger>
      <DialogContent aria-describedby="dialog-description">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col"
          >
            <DialogHeader>
              <DialogTitle>New member</DialogTitle>
            </DialogHeader>
            <DialogBody>
              <FormField
                control={form.control}
                name="first_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Thomas" {...field} />
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
                      <Input placeholder="Bonfils" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="primary_email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="thomas@useconquest.com" {...field} />
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
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  "Create member"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

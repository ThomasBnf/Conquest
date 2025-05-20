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
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  type FormCreate,
  FormCreateSchema,
} from "./schema/company-form.schema";
import { useGetSlug } from "@/hooks/useGetSlug";

export const CreateCompanyDialog = () => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const slug = useGetSlug();

  const { mutateAsync } = trpc.companies.post.useMutation({
    onSuccess: (data) => {
      const { id } = data ?? {};
      toast("Company has been created", {
        action: {
          label: "Open",
          onClick: () => router.push(`/${slug}/companies/${id}`),
        },
        duration: 5000,
      });
    },
    onError: () => {
      toast.error("Failed to create company");
    },
    onSettled: () => {
      setOpen(false);
      setLoading(false);
      form.reset();
    },
  });

  const form = useForm<FormCreate>({
    resolver: zodResolver(FormCreateSchema),
    defaultValues: {
      source: "Manual",
    },
  });

  const isDisabled = loading || !form.formState.isValid;

  const onSubmit = async (data: FormCreate) => {
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
              <DialogTitle>New company</DialogTitle>
            </DialogHeader>
            <DialogBody>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Set Name" {...field} />
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
              <Button type="submit" disabled={isDisabled}>
                {loading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  "Create company"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

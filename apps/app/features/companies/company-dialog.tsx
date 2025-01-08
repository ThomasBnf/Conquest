"use client";

import { createCompany } from "@/actions/companies/createCompany";
import { useUser } from "@/context/userContext";
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
import { useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  type CompanyForm,
  CompanyFormSchema,
} from "./schema/company-form.schema";

export const CompanyDialog = () => {
  const { slug } = useUser();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();

  const form = useForm<CompanyForm>({
    resolver: zodResolver(CompanyFormSchema),
    defaultValues: {
      name: "",
    },
  });

  const isDisabled = loading || !form.formState.isValid;

  const onSubmit = async ({ name }: CompanyForm) => {
    setLoading(true);

    const rCompany = await createCompany({ name });
    const error = rCompany?.serverError;
    const company = rCompany?.data;

    if (error) toast.error(error);
    if (company) {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      router.push(`/${slug}/companies/${company.id}`);
    }

    setLoading(false);
    setOpen(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus size={15} />
          Add Company
        </Button>
      </DialogTrigger>
      <DialogContent aria-describedby="dialog-description">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col"
          >
            <DialogHeader>
              <DialogTitle>Add Company</DialogTitle>
            </DialogHeader>
            <DialogBody>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Acme" {...field} />
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
              <Button type="submit" loading={loading} disabled={isDisabled}>
                Add Company
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

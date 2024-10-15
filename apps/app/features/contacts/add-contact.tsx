import { useUser } from "@/context/userContext";
import { Button } from "@conquest/ui/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
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
import { createContact } from "actions/contacts/createContact";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  type FormCreateContact,
  FormCreateContactSchema,
} from "./types/form-create-contact.schema";

export const AddContact = () => {
  const { slug } = useUser();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const form = useForm<FormCreateContact>({
    resolver: zodResolver(FormCreateContactSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
    },
  });

  const isDisabled = loading || !form.formState.isValid;

  const onSubmit = async ({
    first_name,
    last_name,
    email,
  }: FormCreateContact) => {
    setLoading(true);
    const rContact = await createContact({ first_name, last_name, email });
    const contact = rContact?.data;
    const error = rContact?.serverError;

    if (error) toast.error(error);
    if (contact) router.push(`/${slug}/contacts/${contact.id}`);

    setLoading(false);
    setOpen(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus size={15} />
          Add Contact
        </Button>
      </DialogTrigger>
      <DialogContent aria-describedby="dialog-description">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col divide-y"
          >
            <DialogHeader>
              <DialogTitle>Add Contact</DialogTitle>
              <DialogDescription id="dialog-description">
                Enter the details of the new contact you want to add.
              </DialogDescription>
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
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="email@example.com" {...field} />
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
                Add Contact
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

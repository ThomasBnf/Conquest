import { editActivityType } from "@/actions/activity-types/editActivityType.ts";
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
import type { ActivityType } from "@conquest/zod/schemas/activity-type.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { type FormEdit, FormEditSchema } from "./schema/form-edit.schema";

type Props = {
  open: boolean;
  setOpen: (open: boolean) => void;
  activityType: ActivityType;
};

export const EditActivityTypeDialog = ({
  open,
  setOpen,
  activityType,
}: Props) => {
  const [loading, setLoading] = useState(false);

  const form = useForm<FormEdit>({
    resolver: zodResolver(FormEditSchema),
    defaultValues: {
      name: activityType.name,
      weight: activityType.weight,
    },
  });

  form.setFocus("weight");

  const onSubmit = form.handleSubmit(async ({ name, weight }: FormEdit) => {
    setLoading(true);

    const rActivityType = await editActivityType({
      id: activityType.id,
      name,
      weight,
    });
    const error = rActivityType?.serverError;

    if (error) {
      toast.error(error);
    }

    onCancel();
  });

  const onCancel = () => {
    form.reset();
    setOpen(false);
    setLoading(false);
  };

  useEffect(() => {
    form.reset({
      name: activityType.name,
      weight: activityType.weight,
    });
  }, [activityType, form]);

  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Activity Type</DialogTitle>
          <DialogDescription>
            Edit the activity type to add weight to your activities
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={onSubmit}>
            <DialogBody>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weight</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
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
              <Button type="submit" loading={loading}>
                Update
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

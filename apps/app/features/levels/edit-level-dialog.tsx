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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@conquest/ui/form";
import { Input } from "@conquest/ui/input";
import type { Level } from "@conquest/zod/schemas/level.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { type FormLevel, FormLevelSchema } from "./schema/form.schema";
import { Loader2 } from "lucide-react";

type Props = {
  level: Level;
  open: boolean;
  setOpen: (open: boolean) => void;
};

export const EditLevelDialog = ({ level, open, setOpen }: Props) => {
  const [loading, setLoading] = useState(false);
  const utils = trpc.useUtils();

  const { mutateAsync } = trpc.levels.update.useMutation({
    onSuccess: () => {
      utils.levels.list.invalidate();
      setOpen(false);
      setLoading(false);
      form.reset();
    },
  });

  const form = useForm<FormLevel>({
    resolver: zodResolver(FormLevelSchema),
    defaultValues: {
      name: level.name,
      number: level.number,
      from: level.from,
      to: level.to ?? undefined,
    },
  });

  const onSubmit = async (data: FormLevel) => {
    setLoading(true);
    await mutateAsync({ id: level.id, data });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit {level.name}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogBody>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Ambassador" />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="12" />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="from"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>From</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="900" />
                    </FormControl>
                    <FormDescription>
                      The minimum pulse score required for this level
                    </FormDescription>
                  </FormItem>
                )}
              />
              {level.number < 12 && (
                <FormField
                  control={form.control}
                  name="to"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>To</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="1200" />
                      </FormControl>
                      <FormDescription>
                        The maximum pulse score required for this level
                      </FormDescription>
                    </FormItem>
                  )}
                />
              )}
            </DialogBody>
            <DialogFooter>
              <DialogTrigger asChild>
                <Button type="button" variant="outline" disabled={loading}>
                  Cancel
                </Button>
              </DialogTrigger>
              <Button type="submit" disabled={loading}>
                {loading ? <Loader2 className="size-4 animate-spin" /> : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

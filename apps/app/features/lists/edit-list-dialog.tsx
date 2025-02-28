import { EmojiPicker } from "@/components/custom/emoji-picker";
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
  FormMessage,
} from "@conquest/ui/form";
import { Input } from "@conquest/ui/input";
import { Label } from "@conquest/ui/label";
import type { List } from "@conquest/zod/schemas/list.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { type FormEdit, FormEditSchema } from "./schemas/form-edit.schema";

type Props = {
  list: List;
  open: boolean;
  setOpen: (open: boolean) => void;
};

export const EditListDialog = ({ list, open, setOpen }: Props) => {
  const utils = trpc.useUtils();

  const { mutateAsync, isPending } = trpc.lists.put.useMutation({
    onSuccess: () => {
      utils.lists.get.invalidate({ id: list.id });
      utils.lists.list.invalidate();
    },
  });

  const form = useForm<FormEdit>({
    resolver: zodResolver(FormEditSchema),
    defaultValues: {
      id: list.id,
      emoji: list.emoji,
      name: list.name,
    },
  });

  const onSubmit = async ({ emoji, name }: FormEdit) => {
    await mutateAsync({ id: list.id, emoji, name });
    setOpen(false);
  };

  if (open) {
    return (
      <Dialog open={open} onOpenChange={setOpen} modal>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit list</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <DialogBody>
                <div className="space-y-2">
                  <Label>Name</Label>
                  <div className="flex items-center gap-2">
                    <FormField
                      control={form.control}
                      name="emoji"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <EmojiPicker
                              value={field.value}
                              onSelect={(emoji) => field.onChange(emoji)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input autoFocus {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </DialogBody>
              <DialogFooter>
                <DialogTrigger asChild>
                  <Button variant="outline" disabled={isPending}>
                    Cancel
                  </Button>
                </DialogTrigger>
                <Button type="submit" loading={isPending} disabled={isPending}>
                  Save
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    );
  }
};

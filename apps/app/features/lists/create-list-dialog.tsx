"use client";

import { EmojiPicker } from "@/components/custom/emoji-picker";
import { useFilters } from "@/context/filtersContext";
import { useUser } from "@/context/userContext";
import { useOpenList } from "@/hooks/useOpenList";
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
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { type FormList, FormListSchema } from "./schemas/form-create.schema";

export const CreateListDialog = () => {
  const { groupFilters, resetFilters } = useFilters();
  const { slug } = useUser();
  const { open, setOpen } = useOpenList();

  const router = useRouter();
  const pathname = usePathname();
  const isListPage = pathname.includes("lists");
  const utils = trpc.useUtils();

  const { mutateAsync, isPending } = trpc.lists.post.useMutation({
    onSuccess: (data) => {
      utils.lists.list.invalidate();
      router.push(`/${slug}/lists/${data.id}`);
      onClearFilters();
    },
  });

  const form = useForm<FormList>({
    resolver: zodResolver(FormListSchema),
    defaultValues: {
      emoji: "🚀",
      groupFilters,
    },
  });

  const onClearFilters = () => {
    resetFilters();
    setOpen(false);
    form.reset();
  };

  const onSubmit = async ({ emoji, name }: FormList) => {
    await mutateAsync({ emoji, name, groupFilters });
  };

  if (isListPage) return;

  if (open) {
    return (
      <Dialog open={open} onOpenChange={setOpen} modal>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create new list</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <DialogBody onWheel={(e) => e.stopPropagation()}>
                <div className="flex flex-1 flex-col gap-2">
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
                <Button type="submit" disabled={isPending}>
                  {isPending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    "Save"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    );
  }
};

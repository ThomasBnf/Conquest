import { createList } from "@/actions/lists/createList";
import { EmojiPicker } from "@/components/custom/emoji-picker";
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
import { Separator } from "@conquest/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@conquest/ui/tooltip";
import type { Filter } from "@conquest/zod/schemas/filters.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import { type Dispatch, type SetStateAction, useState } from "react";
import { useForm } from "react-hook-form";
import { type FormList, formListSchema } from "./schemas/form-list";

type Props = {
  filters: Filter[];
  setFilters: Dispatch<SetStateAction<Filter[]>>;
};

export const SaveList = ({ filters, setFilters }: Props) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();
  const pathname = usePathname();
  const isListPage = pathname.includes("lists");

  const onClearFilters = () => setFilters([]);

  const form = useForm<FormList>({
    resolver: zodResolver(formListSchema),
    defaultValues: {
      emoji: "🙂",
      name: "New List",
    },
  });

  const onSubmit = async ({ emoji, name }: FormList) => {
    setLoading(true);
    await createList({ emoji, name, filters });
    queryClient.invalidateQueries({ queryKey: ["lists"] });
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
              <DialogBody>
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
                  <Button variant="outline" disabled={loading}>
                    Cancel
                  </Button>
                </DialogTrigger>
                <Button type="submit" loading={loading} disabled={loading}>
                  Save
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    );
  }

  if (filters.length > 0) {
    return (
      <div className="flex h-full items-center gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" onClick={onClearFilters}>
              Clear
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>Clear all filters</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button onClick={() => setOpen(true)}>Save</Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>Create new view</p>
          </TooltipContent>
        </Tooltip>
        <Separator orientation="vertical" className="ml-1" />
      </div>
    );
  }
};

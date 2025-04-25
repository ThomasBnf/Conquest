import { trpc } from "@/server/client";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@conquest/ui/select";
import { TextField } from "@conquest/ui/text-field";
import { Member } from "@conquest/zod/schemas/member.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  type BulkActivity,
  BulkActivitySchema,
} from "./schemas/bulk-activity.schema";

type Props = {
  members: Member[];
  onReset: () => void;
};

export const BulkActivityDialog = ({ members, onReset }: Props) => {
  const { data } = trpc.activityTypes.list.useQuery();
  const [open, setOpen] = useState(false);

  const activityTypes = data?.filter(
    (activityType) => activityType.source === "Manual",
  );

  const { mutateAsync, isPending } = trpc.activities.postBulk.useMutation({
    onSuccess: () => {
      setOpen(false);
      onReset();
      toast.success("Activities created");
    },
  });

  const form = useForm<BulkActivity>({
    resolver: zodResolver(BulkActivitySchema),
  });

  const onSubmit = async (data: BulkActivity) => {
    await mutateAsync({ ...data, members });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Plus size={16} />
          Activity
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add activity</DialogTitle>
          <DialogDescription>
            Add an activity for the selected members
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogBody>
              <FormField
                control={form.control}
                name="activityTypeKey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Activity type</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={(value) => field.onChange(value)}
                        value={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select activity type" />
                        </SelectTrigger>
                        <SelectContent>
                          {activityTypes && activityTypes?.length > 0 ? (
                            activityTypes?.map((activityType) => (
                              <SelectItem
                                key={activityType.key}
                                value={activityType.key}
                              >
                                {activityType.key}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="empty" disabled>
                              No activity types
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Message</FormLabel>
                    <FormControl>
                      <TextField {...field} placeholder="Add a message" />
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
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  "Add"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

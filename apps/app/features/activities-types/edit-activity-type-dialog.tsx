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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@conquest/ui/select";
import type { ActivityType } from "@conquest/zod/schemas/activity-type.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { v4 as uuid } from "uuid";
import { ConditionChannel } from "./condition-channel";
import {
  type FormActivityType,
  FormActivityTypeSchema,
} from "./schema/form.schema";

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
  const pathname = usePathname();
  const isIntegrationPage = pathname.includes("integrations");
  const utils = trpc.useUtils();

  const { data: channels } = trpc.channels.list.useQuery({});
  const { mutateAsync } = trpc.activityTypes.update.useMutation({
    onSuccess: () => {
      utils.activityTypes.list.invalidate();
      setOpen(false);
      setLoading(false);
      toast.success(
        "Activity type updated, recalculating members Pulse Score...",
      );
    },
  });

  const form = useForm<FormActivityType>({
    resolver: zodResolver(FormActivityTypeSchema),
    defaultValues: { ...activityType },
  });

  const filteredChannels = channels?.filter(
    (channel) => channel.source === form.getValues("source"),
  );

  const onSubmit = async (data: FormActivityType) => {
    setLoading(true);
    await mutateAsync({
      activityType: { ...activityType, ...data },
      isIntegrationPage,
    });
  };

  const addCondition = () => {
    const conditions = form.getValues("conditions");

    form.setValue("conditions", {
      ...conditions,
      rules: [
        ...conditions.rules,
        {
          id: uuid(),
          channel_id: "",
          points: 2,
        },
      ],
    });
  };

  const removeCondition = (index: number) => {
    const conditions = form.getValues("conditions");
    form.setValue("conditions", {
      rules: conditions.rules.filter((_, i) => i !== index),
    });
  };

  const hasNoConditions = !["Api", "Manual", "Livestorm"].includes(
    form.getValues("source"),
  );
  const isInviteOrJoin = ["invite", "join", "login"].some((key) =>
    form.getValues("key").includes(key),
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Activity Type</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogBody>
              <FormField
                control={form.control}
                name="source"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Source</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={(value) => field.onChange(value)}
                      >
                        <SelectTrigger disabled={!activityType.deletable}>
                          <SelectValue placeholder="Select source" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Api">Api</SelectItem>
                          <SelectItem value="Manual">Manual</SelectItem>
                          <SelectItem value="Discord">Discord</SelectItem>
                          <SelectItem value="Discourse">Discourse</SelectItem>
                          <SelectItem value="Github">Github</SelectItem>
                          <SelectItem value="Livestorm">Livestorm</SelectItem>
                          <SelectItem value="Slack">Slack</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                name="key"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Key</FormLabel>
                    <FormControl>
                      <Input {...field} disabled />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="points"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Points</FormLabel>
                    <FormControl>
                      {!hasNoConditions || isInviteOrJoin ? (
                        <Input {...field} />
                      ) : (
                        <div className="flex h-9 w-full items-center gap-2 overflow-hidden rounded-md border">
                          <p className="h-9 shrink-0 place-content-center border-r bg-muted px-2">
                            In any channel{" "}
                          </p>
                          <Input {...field} variant="transparent" />
                          <p className="h-9 w-fit place-content-center border-l bg-muted px-2">
                            points
                          </p>
                        </div>
                      )}
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {hasNoConditions && !isInviteOrJoin && (
                <div className="flex flex-col items-start gap-2">
                  <FormLabel>Channels</FormLabel>
                  {form.watch("conditions").rules.map((_, index) => (
                    <div key={index} className="flex w-full gap-2">
                      <ConditionChannel
                        form={form}
                        index={index}
                        channels={filteredChannels}
                      />
                      <FormField
                        control={form.control}
                        name={`conditions.rules.${index}.points`}
                        render={({ field }) => (
                          <FormItem className="w-full">
                            <FormControl>
                              <div className="flex h-[34px] items-center overflow-hidden rounded-md border">
                                <Input {...field} variant="transparent" />
                                <p className="h-[34px] w-fit place-content-center border-l bg-muted px-2">
                                  Points
                                </p>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="size-[34px] shrink-0"
                        onClick={() => removeCondition(index)}
                      >
                        <X size={16} />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addCondition}
                  >
                    <Plus size={16} />
                    Add Condition
                  </Button>
                </div>
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

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
import cuid from "cuid";
import { Plus, X } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
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
  const utils = trpc.useUtils();

  const { data: channels } = trpc.channels.getAllChannels.useQuery({});
  const { mutateAsync } = trpc.activityTypes.updateActivityType.useMutation({
    onSuccess: () => {
      utils.activityTypes.getAllActivityTypes.invalidate();
      setOpen(false);
      setLoading(false);
    },
  });

  const form = useForm<FormActivityType>({
    resolver: zodResolver(FormActivityTypeSchema),
    defaultValues: {
      ...activityType,
      key: activityType.key.split(":")[1],
    },
  });

  const filteredChannels = channels?.filter(
    (channel) => channel.source === form.getValues("source"),
  );

  const onSubmit = async (values: FormActivityType) => {
    setLoading(true);
    const data = {
      ...values,
      key: `${values.source.toLowerCase()}:${values.key}`,
    };
    await mutateAsync({ id: activityType.id, data });
  };

  const addCondition = () => {
    const conditions = form.getValues("conditions");

    form.setValue("conditions", [
      ...conditions,
      {
        id: cuid(),
        channel_id: "",
        points: 2,
      },
    ]);
  };

  const removeCondition = (index: number) => {
    const conditions = form.getValues("conditions");
    form.setValue(
      "conditions",
      conditions.filter((_, i) => i !== index),
    );
  };

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
                          <SelectItem value="API">API</SelectItem>
                          <SelectItem value="MANUAL">MANUAL</SelectItem>
                          <SelectItem value="DISCORD">DISCORD</SelectItem>
                          <SelectItem value="DISCOURSE">DISCOURSE</SelectItem>
                          <SelectItem value="GITHUB">GITHUB</SelectItem>
                          <SelectItem value="LIVESTORM">LIVESTORM</SelectItem>
                          <SelectItem value="SLACK">SLACK</SelectItem>
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
                      <Input
                        {...field}
                        onBlur={() => {
                          form.setValue(
                            "key",
                            `${field.value?.toLowerCase().replaceAll(" ", "_")}`,
                          );
                        }}
                      />
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
                      <div className="flex items-center overflow-hidden rounded-md border">
                        <p className="h-[34px] w-fit shrink-0 place-content-center border-r bg-muted px-2">
                          {form.getValues("source")} :
                        </p>
                        <Input
                          {...field}
                          disabled={!activityType.deletable}
                          variant="transparent"
                          className="h-[34px]"
                        />
                      </div>
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
                      <div className="flex h-9 w-full items-center gap-2 overflow-hidden rounded-md border">
                        <p className="h-9 shrink-0 place-content-center border-r bg-muted px-2">
                          In any channel{" "}
                        </p>
                        <Input {...field} variant="transparent" />
                        <p className="h-9 w-fit place-content-center border-l bg-muted px-2">
                          points
                        </p>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex flex-col items-start gap-2">
                <FormLabel>Conditions</FormLabel>
                {form.watch("conditions").map((_, index) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                  <div key={index} className="flex w-full gap-2">
                    <ConditionChannel
                      form={form}
                      index={index}
                      channels={filteredChannels}
                    />
                    <FormField
                      control={form.control}
                      name={`conditions.${index}.points`}
                      render={({ field }) => (
                        <FormItem className="w-full">
                          <FormControl>
                            <div className="flex h-[34px] items-center overflow-hidden rounded-md border">
                              <p className="h-[34px] w-fit place-content-center border-r bg-muted px-2">
                                +
                              </p>
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
                <Button type="button" variant="outline" onClick={addCondition}>
                  <Plus size={16} />
                  Add Condition
                </Button>
              </div>
            </DialogBody>
            <DialogFooter>
              <DialogTrigger asChild>
                <Button type="button" variant="outline" disabled={loading}>
                  Cancel
                </Button>
              </DialogTrigger>
              <Button type="submit" loading={loading} disabled={loading}>
                Create
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

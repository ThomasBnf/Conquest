"use client";

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
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, X } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { v4 as uuid } from "uuid";
import { ConditionChannel } from "./condition-channel";
import {
  type FormActivityType,
  FormActivityTypeSchema,
} from "./schema/form.schema";

export const CreateActivityTypeDialog = () => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const utils = trpc.useUtils();

  const { data: channels } = trpc.channels.list.useQuery({});
  const { mutateAsync } = trpc.activityTypes.post.useMutation({
    onSuccess: () => {
      utils.activityTypes.list.invalidate();
      setOpen(false);
      setLoading(false);
      form.reset();
    },
  });

  const form = useForm<FormActivityType>({
    resolver: zodResolver(FormActivityTypeSchema),
    defaultValues: {
      source: "Manual",
      points: 3,
      conditions: {
        rules: [],
      },
      deletable: true,
    },
  });

  const filteredChannels = channels?.filter(
    (channel) => channel.source === form.getValues("source"),
  );

  const onSubmit = async (data: FormActivityType) => {
    setLoading(true);
    await mutateAsync(data);
  };

  const addCondition = () => {
    const conditions = form.getValues("conditions");

    form.setValue("conditions", {
      ...conditions,
      rules: [
        ...conditions.rules,
        {
          id: uuid(),
          channelId: "",
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

  const isManualOrApi = ["Api", "Manual"].includes(form.getValues("source"));
  const isInviteOrJoin = ["invite", "join"].includes(form.getValues("key"));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus size={16} />
          Activity Type
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Activity Type</DialogTitle>
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
                        <SelectTrigger>
                          <SelectValue placeholder="Select source" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Api">Api</SelectItem>
                          <SelectItem value="Manual">Manual</SelectItem>
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
                          if (!field.value) return;
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
                          {form.getValues("source").toLowerCase()}:
                        </p>
                        <Input
                          {...field}
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
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {!isManualOrApi && !isInviteOrJoin && (
                <div className="flex flex-col items-start gap-2">
                  <FormLabel>Conditions</FormLabel>
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
                                <p className="h-[34px] w-fit place-content-center border-r bg-muted px-2">
                                  +
                                </p>
                                <Input
                                  {...field}
                                  type="number"
                                  variant="transparent"
                                />
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
                {loading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  "Create"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

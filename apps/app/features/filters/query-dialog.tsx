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
import { Form, FormField } from "@conquest/ui/form";
import { Input } from "@conquest/ui/input";
import {
  type Filter,
  FilterActivitySchema,
  FilterNumberSchema,
  FilterTextSchema,
} from "@conquest/zod/filters.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

type Props = {
  type?: "text" | "number";
  filter: Filter | undefined;
  tab?: "query" | "select" | "activity";
  setTab?: (tab: "query" | "select" | "activity" | undefined) => void;
  handleApply: (query: string | number) => void;
  triggerButton?: boolean;
};

const FormSchema = z.object({
  query: z.string().or(z.coerce.number()),
});

type FormSchema = z.infer<typeof FormSchema>;

export const QueryDialog = ({
  type = "text",
  filter,
  tab,
  setTab,
  handleApply,
  triggerButton,
}: Props) => {
  if (!filter) return null;

  const [open, setOpen] = useState(false);

  const dialogTitle = `Filter by ${filter.label.toLowerCase()}...`;

  const getFilterValue = () => {
    switch (filter.type) {
      case "text":
        return FilterTextSchema.parse(filter);
      case "number":
        return FilterNumberSchema.parse(filter);
      case "activity":
        return FilterActivitySchema.parse(filter);
    }
  };
  const filterValue = getFilterValue();

  const form = useForm<FormSchema>({
    resolver: zodResolver(FormSchema),
    defaultValues: triggerButton
      ? { query: filterValue?.value ?? "" }
      : undefined,
  });

  const onSubmit = ({ query }: FormSchema) => {
    handleApply(query);
    setOpen(false);
  };

  const handleOpenChange = () => {
    setTab?.(undefined);
    form.reset();
  };

  const dialogContent = (
    <DialogContent>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <DialogHeader>
            <DialogTitle>{dialogTitle}</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <FormField
              control={form.control}
              name="query"
              render={({ field }) => (
                <Input
                  {...field}
                  type={type}
                  min={type === "number" ? 1 : undefined}
                />
              )}
            />
          </DialogBody>
          <DialogFooter>
            <DialogTrigger asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogTrigger>
            <Button type="submit">Apply</Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );

  if (triggerButton) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="dropdown">
            {filterValue?.value}
            {type === "number" &&
              (filterValue?.value && Number(filterValue.value) > 1
                ? " times"
                : " time")}
          </Button>
        </DialogTrigger>
        {dialogContent}
      </Dialog>
    );
  }

  return (
    <Dialog open={tab === "query"} onOpenChange={handleOpenChange}>
      {dialogContent}
    </Dialog>
  );
};

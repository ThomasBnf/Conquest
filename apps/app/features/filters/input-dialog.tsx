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
  type FilterActivity,
  FilterActivitySchema,
  type FilterNumber,
  FilterNumberSchema,
  type FilterText,
  FilterTextSchema,
} from "@conquest/zod/filters.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useTab } from "./hooks/useTab";

type Props = {
  type?: "text" | "number";
  filter: FilterText | FilterNumber | FilterActivity;
  handleApply: (query: string | number) => void;
  triggerButton?: boolean;
};

const FormSchema = z.object({
  query: z.string().or(z.coerce.number()),
});

type FormSchema = z.infer<typeof FormSchema>;

export const InputDialog = ({
  type = "text",
  filter,
  handleApply,
  triggerButton,
}: Props) => {
  if (!filter) return null;

  const { tab, setTab } = useTab();
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
    defaultValues: {
      query: filterValue?.value,
    },
  });

  const onSubmit = ({ query }: FormSchema) => {
    if (filter.type === "number") {
      const filterNumber = FilterNumberSchema.parse(filter);
      if (filterNumber.field === "level") {
        if (Number(query) > 12) {
          return form.setError("query", {
            message: "Level cannot be greater than 12",
          });
        }
      }
    }
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
                <FormItem>
                  <FormLabel />
                  <FormControl>
                    <Input
                      {...field}
                      defaultValue={filterValue?.value ?? ""}
                      type={type}
                      min={type === "number" ? 0 : undefined}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
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
          <Button variant="dropdown" className="shrink-0">
            {filterValue?.value}
            {filter.type === "activity" &&
              (filter.value > 1 ? " times" : " time")}
          </Button>
        </DialogTrigger>
        {dialogContent}
      </Dialog>
    );
  }

  return (
    <Dialog open={tab === "input"} onOpenChange={handleOpenChange}>
      {dialogContent}
    </Dialog>
  );
};

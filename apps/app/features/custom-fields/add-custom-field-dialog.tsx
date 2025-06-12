"use client";

import { useWorkspace } from "@/hooks/useWorkspace";
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
} from "@conquest/ui/form";
import { Input } from "@conquest/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@conquest/ui/select";
import { CustomField } from "@conquest/zod/schemas/custom-field.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { v4 as uuid } from "uuid";
import { useCreateField } from "./mutations/useCreateField";
import { AddField, AddFieldSchema } from "./schemas/add-field.schema";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (id: string) => void;
};

export const AddCustomFieldDialog = ({
  open,
  onOpenChange,
  onSelect,
}: Props) => {
  const { workspace } = useWorkspace();

  const form = useForm<AddField>({
    resolver: zodResolver(AddFieldSchema),
    defaultValues: {
      type: "TEXT",
      label: "",
    },
  });

  const createField = useCreateField();

  const onSubmit = (data: AddField) => {
    const newField: CustomField = {
      id: uuid(),
      label: data.label,
      type: data.type,
      record: "MEMBER",
      workspaceId: workspace?.id ?? "",
      createdAt: new Date(),
      updatedAt: new Date(),
      options: [],
    };

    createField(newField);
    onSelect(newField.id);
    onOpenChange(false);
  };

  if (!workspace) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add custom field</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogBody>
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="TEXT">Text</SelectItem>
                          <SelectItem value="NUMBER">Number</SelectItem>
                          <SelectItem value="DATE">Date</SelectItem>
                          <SelectItem value="SELECT">Select</SelectItem>
                          <SelectItem value="MULTISELECT">
                            Multi-select
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="label"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Label</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </DialogBody>
            <DialogFooter>
              <DialogTrigger asChild>
                <Button variant="outline">Cancel</Button>
              </DialogTrigger>
              <Button type="submit">Add</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

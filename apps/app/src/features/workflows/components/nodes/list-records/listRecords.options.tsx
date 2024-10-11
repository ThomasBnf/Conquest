import { useWorkflow } from "@/context/workflowContext";
import { NodeListRecordsSchema } from "@/schemas/node.schema";
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
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { FilterOptions } from "./filter/filter.options";
import { type FormSource, FormSourceSchema } from "./types/form-source.schema";

export const ListRecordsOptions = () => {
  const { currentNode, onUpdateNode } = useWorkflow();
  const parsedData = NodeListRecordsSchema.parse(currentNode?.data);

  const form = useForm<FormSource>({
    resolver: zodResolver(FormSourceSchema),
    defaultValues: {
      source: parsedData.source,
    },
  });

  if (!currentNode) return;

  const onSubmit = ({ source }: FormSource) => {
    onUpdateNode({
      ...currentNode,
      data: {
        ...parsedData,
        source,
      },
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="source"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Source</FormLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    form.handleSubmit(onSubmit)();
                  }}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="contacts">Contacts</SelectItem>
                    <SelectItem value="activities" disabled>
                      Activities
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
      <FilterOptions />
    </div>
  );
};

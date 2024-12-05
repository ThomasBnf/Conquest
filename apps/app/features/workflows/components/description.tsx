import {
  type FormDescription,
  FormDescriptionSchema,
} from "@/features/workflows/panels/schemas/form-description.schema";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@conquest/ui/form";
import { Input } from "@conquest/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useReactFlow } from "@xyflow/react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import type { WorkflowNode } from "../panels/schemas/workflow-node.type";

type Props = {
  id: string;
};

export const Description = ({ id }: Props) => {
  const { getNode, updateNode } = useReactFlow();
  const node = getNode(id) as WorkflowNode | undefined;
  const form = useForm<FormDescription>({
    resolver: zodResolver(FormDescriptionSchema),
    defaultValues: {
      description: node?.data.description ?? "",
    },
  });

  useEffect(() => {
    if (!node) return;
    form.reset({
      description: node?.data.description ?? "",
    });
  }, [node]);

  if (!node) return null;

  const onSubmit = ({ description }: FormDescription) => {
    updateNode(id, {
      data: {
        ...node.data,
        description,
      },
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Add a description"
                  onChange={(e) => {
                    field.onChange(e);
                    onSubmit({ description: e.target.value });
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
};

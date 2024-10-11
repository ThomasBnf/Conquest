import { useWorkflow } from "@/context/workflowContext";
import {
  type FormDescription,
  FormDescriptionSchema,
} from "@/features/workflows/components/panels/types/form-description.schema";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@conquest/ui/form";
import { Input } from "@conquest/ui/input";
import { Separator } from "@conquest/ui/separator";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

export const Description = () => {
  const { currentNode, onUpdateNode } = useWorkflow();

  const form = useForm<FormDescription>({
    resolver: zodResolver(FormDescriptionSchema),
    defaultValues: {
      description: currentNode?.data.description,
    },
  });

  const onSubmit = ({ description }: FormDescription) => {
    if (!currentNode) return;

    onUpdateNode({
      ...currentNode,
      data: {
        ...currentNode.data,
        description,
      },
    });
  };

  useEffect(() => {
    if (!currentNode) return;

    form.setValue("description", currentNode.data.description);
  }, [currentNode]);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-2"
      >
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
                  onBlur={(e) => {
                    if (!currentNode) return;

                    onUpdateNode({
                      ...currentNode,
                      data: {
                        ...currentNode.data,
                        description: e.target.value,
                      },
                    });
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Separator />
      </form>
    </Form>
  );
};

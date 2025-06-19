import { COLORS } from "@/constant";
import { Button } from "@conquest/ui/button";
import { ColorPicker } from "@conquest/ui/color-picker";
import { Form, FormControl, FormField, FormItem } from "@conquest/ui/form";
import { Input } from "@conquest/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@conquest/ui/popover";
import type { Tag } from "@conquest/zod/schemas/tag.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check } from "lucide-react";
import { useSession } from "next-auth/react";
import { v4 as uuid } from "uuid";
import { useForm } from "react-hook-form";
import { useCreateTag } from "./mutations/useCreateTag";
import { useUpdateTag } from "./mutations/useUpdateTag";
import { type FormTag, FormTagSchema } from "./schema/form.schema";

type Props = {
  tag?: Tag;
  setIsEditing?: (value: boolean) => void;
  setIsVisible?: (value: boolean) => void;
};

export const TagForm = ({ tag, setIsVisible, setIsEditing }: Props) => {
  const { data: session } = useSession();
  const { workspaceId } = session?.user ?? {};

  const createTag = useCreateTag({});
  const updateTag = useUpdateTag({ tag });

  const form = useForm<FormTag>({
    resolver: zodResolver(FormTagSchema),
    defaultValues: {
      name: tag?.name || "",
      color: tag?.color || "#0070f3",
    },
  });

  const onSubmit = async ({ name, color }: FormTag) => {
    setIsVisible?.(false);
    setIsEditing?.(false);
    form.reset();

    if (tag) {
      return await updateTag({
        id: tag.id,
        name,
        color,
      });
    }

    if (!workspaceId) return;

    const newTag = {
      id: uuid(),
      externalId: null,
      name,
      color,
      source: "Manual" as const,
      workspaceId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await createTag(newTag);
  };

  const onCancel = () => {
    setIsEditing?.(false);
    setIsVisible?.(false);
    form.reset();
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex gap-2 items-center p-2 rounded-md border bg-muted"
      >
        <FormField
          control={form.control}
          name="color"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="size-8">
                      <div
                        className="rounded-full size-3"
                        style={{ backgroundColor: field.value }}
                      />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="flex gap-4 items-center p-2 w-fit">
                    {COLORS.map((color) => (
                      <button
                        type="button"
                        key={color.hex}
                        onClick={() => field.onChange(color.hex)}
                        className="flex justify-center items-center text-white rounded-full transition-transform cursor-pointer size-4 hover:scale-110"
                        style={{
                          backgroundColor: color.hex,
                        }}
                      >
                        {field.value === color.hex && <Check size={13} />}
                      </button>
                    ))}
                    <ColorPicker
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </PopoverContent>
                </Popover>
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormControl>
                <Input
                  {...field}
                  autoFocus
                  placeholder="Tag name"
                  className="h-8 rounded"
                />
              </FormControl>
            </FormItem>
          )}
        />
        <div className="flex gap-2 items-center">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">Save</Button>
        </div>
      </form>
    </Form>
  );
};

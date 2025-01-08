import { createTag } from "@/actions/tags/createTag";
import { updateTag } from "@/actions/tags/updateTag";
import { colors } from "@/constant";
import { Button } from "@conquest/ui/button";
import { ColorPicker } from "@conquest/ui/color-picker";
import { Form, FormControl, FormField, FormItem } from "@conquest/ui/form";
import { Input } from "@conquest/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@conquest/ui/popover";
import type { Tag } from "@conquest/zod/schemas/tag.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check } from "lucide-react";
import { useForm } from "react-hook-form";
import { type FormTag, FormTagSchema } from "./schema/form.schema";

type Props = {
  tag?: Tag;
  isVisible?: boolean;
  setIsVisible?: (value: boolean) => void;
  isEditing?: boolean;
  setIsEditing?: (value: boolean) => void;
};

export const TagForm = ({
  tag,
  isVisible,
  setIsVisible,
  isEditing,
  setIsEditing,
}: Props) => {
  const form = useForm<FormTag>({
    resolver: zodResolver(FormTagSchema),
    defaultValues: {
      name: tag?.name || "",
      color: tag?.color || "#0070f3",
    },
  });

  if (isVisible !== undefined && !isVisible) return;
  if (isEditing !== undefined && !isEditing) return;

  const onSubmit = async ({ name, color }: FormTag) => {
    if (tag && isEditing !== undefined) {
      await updateTag({ id: tag.id, name, color });
    } else {
      await createTag({
        external_id: null,
        name,
        color,
        source: "MANUAL",
      });
    }

    setIsVisible?.(false);
    setIsEditing?.(false);
    form.reset();
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
        className="flex items-center gap-2 rounded-md border bg-muted p-2"
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
                        className="size-3 rounded-full"
                        style={{ backgroundColor: field.value }}
                      />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="flex w-fit items-center gap-4 p-2">
                    {colors.map((color) => (
                      // biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
                      <div
                        key={color}
                        onClick={() => field.onChange(color)}
                        className="flex size-4 cursor-pointer items-center justify-center rounded-full text-white transition-transform hover:scale-110"
                        style={{
                          backgroundColor: color,
                        }}
                      >
                        {field.value === color && <Check size={13} />}
                      </div>
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
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">Save</Button>
        </div>
      </form>
    </Form>
  );
};

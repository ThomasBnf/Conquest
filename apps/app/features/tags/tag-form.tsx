import { COLORS } from "@/constant";
import { trpc } from "@/server/client";
import { Button } from "@conquest/ui/button";
import { ColorPicker } from "@conquest/ui/color-picker";
import { Form, FormControl, FormField, FormItem } from "@conquest/ui/form";
import { Input } from "@conquest/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@conquest/ui/popover";
import type { Tag } from "@conquest/zod/schemas/tag.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check } from "lucide-react";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { v4 as uuid } from "uuid";
import { type FormTag, FormTagSchema } from "./schema/form.schema";

type Props = {
  tag?: Tag;
  setIsEditing?: (value: boolean) => void;
  setIsVisible?: (value: boolean) => void;
};

export const TagForm = ({ tag, setIsVisible, setIsEditing }: Props) => {
  const { data: session } = useSession();
  const { workspaceId } = session?.user ?? {};
  const utils = trpc.useUtils();

  const { mutateAsync: createTag } = trpc.tags.post.useMutation({
    onSuccess: () => {
      utils.tags.list.invalidate();
      setIsVisible?.(false);
      setIsEditing?.(false);
      form.reset();
    },
    onError: (error) => {
      console.error(error);
    },
  });

  const { mutateAsync: updateTag } = trpc.tags.update.useMutation({
    onSuccess: () => {
      utils.tags.list.invalidate();
      setIsVisible?.(false);
      setIsEditing?.(false);
      form.reset();
    },
  });

  const form = useForm<FormTag>({
    resolver: zodResolver(FormTagSchema),
    defaultValues: {
      name: tag?.name || "",
      color: tag?.color || "#0070f3",
    },
  });

  console.log(form.formState.errors);

  const onSubmit = async ({ name, color }: FormTag) => {
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
                    {COLORS.map((color) => (
                      <button
                        type="button"
                        key={color.hex}
                        onClick={() => field.onChange(color.hex)}
                        className="flex size-4 cursor-pointer items-center justify-center rounded-full text-white transition-transform hover:scale-110"
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

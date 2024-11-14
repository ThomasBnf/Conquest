import { getSlug } from "@/features/workspaces/actions/getSlug";
import { cn } from "@conquest/ui/cn";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@conquest/ui/form";
import { Input } from "@conquest/ui/input";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { type UseFormReturn, useWatch } from "react-hook-form";
import { useDebounce } from "use-debounce";
import type { Workspace } from "../schemas/create-workspace.schema";

type Props = {
  form: UseFormReturn<Workspace>;
};

export const WorkspaceFields = ({ form }: Props) => {
  const [isFocus, setFocus] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const companyName = useWatch({
    control: form.control,
    name: "workspace_name",
  });

  const [debouncedValue, setValue] = useDebounce(companyName, 500);

  const checkSlug = async (slug: string) => {
    setLoading(true);
    const rSlug = await getSlug({ slug });
    const slugData = rSlug?.data;

    if (slugData === 0) {
      form.clearErrors("slug");
      setFocus(false);
    } else if (slugData === 1) {
      form.setError("slug", { message: "Slug already taken" });
    }

    setLoading(false);
  };

  useEffect(() => {
    if (debouncedValue) {
      const slug = debouncedValue.toLowerCase().replace(/\s+/g, "-");
      form.setValue("slug", slug);
      checkSlug(slug);
    }
  }, [debouncedValue, form]);

  return (
    <>
      <FormField
        name="workspace_name"
        control={form.control}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Workspace Name</FormLabel>
            <FormControl>
              <Input
                {...field}
                placeholder="Acme"
                onChange={(e) => {
                  field.onChange(e);
                  setValue(e.target.value);
                }}
              />
            </FormControl>
          </FormItem>
        )}
      />
      <FormField
        name="slug"
        control={form.control}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Slug</FormLabel>
            <FormControl>
              <div
                className={cn(
                  "relative flex items-center rounded-md border pl-3",
                  isFocus && "ring-2 ring-ring",
                )}
              >
                <p>useconquest.com/</p>
                <Input
                  {...field}
                  variant="transparent"
                  placeholder="acme"
                  className="pl-0"
                  onFocus={() => setFocus(true)}
                  onBlur={() => setFocus(false)}
                  onChange={(e) => {
                    field.onChange(e);
                    setValue(e.target.value.toLowerCase().replace(/\s+/g, "-"));
                  }}
                />
                {isLoading && (
                  <Loader2 className="absolute right-3 size-4 animate-spin text-muted-foreground" />
                )}
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};

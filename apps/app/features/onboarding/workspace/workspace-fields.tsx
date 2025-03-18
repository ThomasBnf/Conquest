import { cn } from "@conquest/ui/cn";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@conquest/ui/form";
import { Input } from "@conquest/ui/input";
import slugify from "@sindresorhus/slugify";
import { useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import type { Workspace } from "../schemas/create-workspace.schema";

type Props = {
  form: UseFormReturn<Workspace>;
};

export const WorkspaceFields = ({ form }: Props) => {
  const [focus, setFocus] = useState(false);

  return (
    <>
      <FormField
        name="name"
        control={form.control}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Workspace name</FormLabel>
            <FormControl>
              <Input
                {...field}
                placeholder="Acme"
                onChange={(e) => {
                  field.onChange(e);
                  form.setValue(
                    "slug",
                    slugify(e.target.value, { decamelize: false }),
                  );
                }}
              />
            </FormControl>
            <FormMessage />
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
                  "relative flex items-center overflow-hidden rounded-md border",
                  focus && "border-main-200 ring-2 ring-ring",
                )}
              >
                <p className="h-9 place-content-center border-r bg-muted px-3">
                  useconquest.com
                </p>
                <Input
                  {...field}
                  variant="transparent"
                  placeholder="acme"
                  onFocus={() => setFocus(true)}
                  onBlur={() => setFocus(false)}
                />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};

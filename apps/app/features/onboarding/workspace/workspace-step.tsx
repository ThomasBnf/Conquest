import { trpc } from "@/server/client";
import { Button } from "@conquest/ui/button";
import { CardContent, CardFooter } from "@conquest/ui/card";
import { cn } from "@conquest/ui/cn";
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
import { ArrowRightIcon, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { type Dispatch, type SetStateAction, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useDebounce } from "use-debounce";
import {
  type Workspace,
  WorkspaceSchema,
} from "../schemas/create-workspace.schema";
import { UserFields } from "./user-fields";

type Props = {
  setStep: Dispatch<SetStateAction<number>>;
};

export const WorkspaceStep = ({ setStep }: Props) => {
  const { data: session } = useSession();
  const { user } = session ?? {};
  const { workspace } = user ?? {};

  const [loading, setLoading] = useState(false);
  const [isFocus, setFocus] = useState(false);
  const utils = trpc.useUtils();

  const { mutateAsync } = trpc.users.update.useMutation({
    onSuccess: () => {
      utils.users.get.invalidate();
    },
    onError: (error) => {
      setLoading(false);
      toast.error(error.message);
    },
  });

  const { mutateAsync: mutateWorkspace } = trpc.workspaces.update.useMutation({
    onSuccess: () => {
      utils.workspaces.get.invalidate();
      utils.users.get.invalidate();
      setStep(2);
      setLoading(false);
    },
    onError: (error) => {
      setLoading(false);
      toast.error(error.message);
    },
  });

  const form = useForm<Workspace>({
    resolver: zodResolver(WorkspaceSchema),
    mode: "onChange",
  });

  const currentSlug = form.watch("slug");
  const [debouncedSlug] = useDebounce(currentSlug, 500);

  const {
    data: slugCount,
    isLoading: isSlugChecking,
    isFetched,
  } = trpc.workspaces.getSlug.useQuery(
    { slug: debouncedSlug },
    { enabled: Boolean(debouncedSlug) },
  );

  const isSlugTaken =
    slugCount && slugCount > 0 && currentSlug !== workspace?.slug;

  const areFieldsFilled = form
    .watch(["first_name", "last_name", "workspace_name", "slug"])
    .every(Boolean);

  const isFormDisabled =
    loading ||
    isSlugChecking ||
    isSlugTaken ||
    (!isFetched && Boolean(currentSlug)) ||
    !areFieldsFilled ||
    Object.keys(form.formState.errors).length > 0;

  useEffect(() => {
    if (!currentSlug) return;

    if (isSlugTaken) {
      form.setError("slug", { message: "Slug already taken" });
    } else if (isFetched && debouncedSlug === currentSlug) {
      form.clearErrors("slug");
    }
  }, [isSlugTaken, currentSlug, debouncedSlug, isFetched, form]);

  const onSubmit = async ({
    first_name,
    last_name,
    workspace_name,
    slug,
  }: Workspace) => {
    if (!user || !workspace || isSlugTaken) return;

    setLoading(true);

    await mutateAsync({
      id: user.id,
      first_name,
      last_name,
    });

    await mutateWorkspace({
      ...workspace,
      name: workspace_name,
      slug,
    });
  };

  const generateSlugFromName = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <UserFields form={form} />
          <FormField
            name="workspace_name"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nom de l'espace de travail</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Acme"
                    onChange={(e) => {
                      field.onChange(e);
                      if (
                        !form.getValues("slug") ||
                        form.getValues("slug") ===
                          generateSlugFromName(field.value)
                      ) {
                        const newSlug = generateSlugFromName(e.target.value);
                        form.setValue("slug", newSlug, {
                          shouldValidate: true,
                        });
                      }
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
                      isFocus && "border-main-200 ring-2 ring-ring",
                    )}
                  >
                    <p className="h-9 place-content-center border-r bg-muted px-3">
                      useconquest.com/
                    </p>
                    <Input
                      {...field}
                      variant="transparent"
                      placeholder="acme"
                      onFocus={() => setFocus(true)}
                      onBlur={() => setFocus(false)}
                    />
                    {isSlugChecking && (
                      <Loader2 className="absolute right-3 size-4 animate-spin text-muted-foreground" />
                    )}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isFormDisabled}>
            {loading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <>
                Suivant
                <ArrowRightIcon size={16} />
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Form>
  );
};

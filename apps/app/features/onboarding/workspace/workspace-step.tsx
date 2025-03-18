import { trpc } from "@/server/client";
import { Button } from "@conquest/ui/button";
import { CardContent, CardFooter } from "@conquest/ui/card";
import { Form } from "@conquest/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import slugify from "@sindresorhus/slugify";
import { ArrowRightIcon, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { type Dispatch, type SetStateAction, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  type Workspace,
  WorkspaceSchema,
} from "../schemas/create-workspace.schema";
import { UserFields } from "./user-fields";
import { WorkspaceFields } from "./workspace-fields";

type Props = {
  setStep: Dispatch<SetStateAction<number>>;
};

export const WorkspaceStep = ({ setStep }: Props) => {
  const { data: session } = useSession();
  const { user } = session ?? {};

  const [loading, setLoading] = useState(false);
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
      form.setError("slug", { message: error.message });
    },
  });

  const form = useForm<Workspace>({
    resolver: zodResolver(WorkspaceSchema),
  });

  const onSubmit = async ({ first_name, last_name, name, slug }: Workspace) => {
    if (!user) return;

    const formattedSlug = slugify(slug, { decamelize: false });

    setLoading(true);

    await mutateAsync({
      id: user.id,
      first_name,
      last_name,
    });

    await mutateWorkspace({
      id: user.workspace_id,
      name,
      slug: formattedSlug,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <UserFields form={form} />
          <WorkspaceFields form={form} />
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={loading}>
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

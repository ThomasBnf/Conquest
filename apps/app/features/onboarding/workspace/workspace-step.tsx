import { useUser } from "@/context/userContext";
import { trpc } from "@/server/client";
import { Button } from "@conquest/ui/button";
import { CardContent, CardFooter } from "@conquest/ui/card";
import { Form } from "@conquest/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRightIcon } from "lucide-react";
import { type Dispatch, type SetStateAction, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import {
  type Workspace,
  WorkspaceSchema,
} from "../schemas/create-workspace.schema";
import { UserFields } from "./user-fields";
import { WorkspaceFields } from "./workspace-name";

type Props = {
  setStep: Dispatch<SetStateAction<number>>;
};

export const WorkspaceStep = ({ setStep }: Props) => {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);

  const { mutateAsync } = trpc.users.updateUser.useMutation({
    onError: (error) => {
      setLoading(false);
      toast.error(error.message);
    },
  });

  const { mutateAsync: mutateWorkspace } =
    trpc.workspaces.updateWorkspace.useMutation({
      onSuccess: () => {
        setStep(2);
      },
      onError: (error) => {
        setLoading(false);
        toast.error(error.message);
      },
    });

  const form = useForm<Workspace>({
    resolver: zodResolver(WorkspaceSchema),
    defaultValues: {
      slug: "",
    },
  });

  const [first_name, last_name, workspace_name, slug] = useWatch({
    control: form.control,
    name: ["first_name", "last_name", "workspace_name", "slug"],
  });

  const isDisabled =
    loading ||
    !first_name ||
    !last_name ||
    !workspace_name ||
    !slug ||
    !!form.formState.errors.slug;

  const onSubmit = async ({
    first_name,
    last_name,
    workspace_name,
    slug,
  }: Workspace) => {
    if (!user) return;

    setLoading(true);
    await mutateAsync({
      id: user.id,
      data: { first_name, last_name },
    });

    await mutateWorkspace({
      id: user.workspace_id,
      data: { name: workspace_name, slug },
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
          <Button
            type="submit"
            className="w-full"
            loading={loading}
            disabled={isDisabled}
          >
            Next
            <ArrowRightIcon size={16} />
          </Button>
        </CardFooter>
      </form>
    </Form>
  );
};

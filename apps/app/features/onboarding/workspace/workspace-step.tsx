import { updateUser } from "@/features/auth/actions/updateUser";
import { updateWorkspace } from "@/features/workspaces/actions/updateWorkspace";
import { Button } from "@conquest/ui/button";
import { Form } from "@conquest/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRightIcon } from "lucide-react";
import { type Dispatch, type SetStateAction, useState } from "react";
import { useForm } from "react-hook-form";
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
  const [loading, setLoading] = useState(false);

  const form = useForm<Workspace>({
    resolver: zodResolver(WorkspaceSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      workspace_name: "",
      slug: "",
    },
  });

  const isDisabled =
    loading || !form.formState.isValid || !!form.formState.errors.slug;

  const onSubmit = async ({
    first_name,
    last_name,
    workspace_name,
    slug,
  }: Workspace) => {
    setLoading(true);

    const rUser = await updateUser({ first_name, last_name });
    const error = rUser?.serverError;

    if (error) {
      setLoading(false);
      return toast.error(error);
    }

    const rWorkspace = await updateWorkspace({
      name: workspace_name,
      slug,
    });
    const errorWorkspace = rWorkspace?.serverError;

    if (errorWorkspace) {
      setLoading(false);
      return toast.error(errorWorkspace);
    }

    setStep(2);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
      >
        <UserFields form={form} />
        <WorkspaceFields form={form} />
        <Button
          type="submit"
          loading={loading}
          disabled={isDisabled}
          className="mt-4"
        >
          Next
          <ArrowRightIcon size={16} />
        </Button>
      </form>
    </Form>
  );
};

import { useUser } from "@/context/userContext";
import { updateUser } from "@/features/auth/actions/updateUser";
import { updateWorkspace } from "@/features/workspaces/actions/updateWorkspace";
import { Button } from "@conquest/ui/button";
import { Form } from "@conquest/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRightIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  type Questions,
  QuestionsSchema,
} from "../schemas/create-workspace.schema";
import { CompanySize } from "./company-size";
import { Source } from "./source";

export const QuestionsStep = () => {
  const { slug } = useUser();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const form = useForm<Questions>({
    resolver: zodResolver(QuestionsSchema),
    defaultValues: {
      company_size: undefined,
      source: undefined,
    },
  });

  const isDisabled = loading || !form.formState.isValid;

  const onSubmit = async ({ company_size, source }: Questions) => {
    setLoading(true);

    const rUser = await updateUser({ onboarding: new Date() });
    const error = rUser?.serverError;

    if (error) {
      setLoading(false);
      return toast.error(error);
    }

    const rWorkspace = await updateWorkspace({
      company_size,
      source,
    });
    const errorWorkspace = rWorkspace?.serverError;

    if (errorWorkspace) {
      setLoading(false);
      return toast.error(error);
    }

    router.push(`/${slug}`);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
      >
        <Source form={form} />
        <CompanySize form={form} />
        <Button
          type="submit"
          onClick={() => router.replace(`/${slug}`)}
          loading={loading}
          disabled={isDisabled}
          className="mt-4"
        >
          Get Started
          <ArrowRightIcon size={16} />
        </Button>
      </form>
    </Form>
  );
};

import { trpc } from "@/server/client";
import { Button } from "@conquest/ui/button";
import { CardContent, CardFooter } from "@conquest/ui/card";
import { Form } from "@conquest/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRightIcon, Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  type Questions,
  QuestionsSchema,
} from "../schemas/workspace-form.schema";
import { CompanySize } from "./company-size";
import { Source } from "./source";

type Props = {
  setStep: (step: number) => void;
};

export const QuestionsStep = ({ setStep }: Props) => {
  const [loading, setLoading] = useState(false);
  const { data: workspace } = trpc.workspaces.get.useQuery();

  const { mutateAsync: mutateWorkspace } = trpc.workspaces.update.useMutation({
    onSuccess: () => {
      setStep(3);
    },
    onError: (error) => {
      setLoading(false);
      toast.error(error.message);
    },
  });

  const form = useForm<Questions>({
    resolver: zodResolver(QuestionsSchema),
  });

  const onSubmit = async ({ companySize, source }: Questions) => {
    if (!workspace) return;

    setLoading(true);

    await mutateWorkspace({
      ...workspace,
      companySize,
      source,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <Source form={form} />
          <CompanySize form={form} />
        </CardContent>
        <CardFooter>
          <Button
            type="submit"
            disabled={!form.formState.isValid || loading}
            className="w-full"
          >
            {loading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <>
                Continue
                <ArrowRightIcon size={16} />
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Form>
  );
};

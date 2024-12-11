import { deleteIntegration } from "@/actions/integrations/deleteIntegration";
import { DeleteDialog } from "@/components/custom/delete-dialog";
import { useUser } from "@/context/userContext";
import { toast } from "sonner";

export const UninstallButton = () => {
  const { slack } = useUser();

  const onClick = async () => {
    if (!slack) return;

    const response = await deleteIntegration({
      integration: slack,
      source: "SLACK",
    });

    const error = response?.serverError;

    if (error) toast.error(error);
    return toast.success("Slack disconnected");
  };

  return (
    <DeleteDialog
      title="Uninstall Slack"
      description="Slack integration will be removed from your workspace and all your data will be deleted."
      onConfirm={onClick}
    >
      Uninstall
    </DeleteDialog>
  );
};

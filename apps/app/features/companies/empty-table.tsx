import { Button } from "@conquest/ui/button";
import { Companies } from "@conquest/ui/icons/Companies";
import { useRouter } from "next/navigation";

export const EmptyTable = () => {
  const router = useRouter();

  return (
    <div className="flex h-full flex-col items-center justify-center text-center">
      <Companies />
      <div className="mt-2 mb-4">
        <p className="font-medium text-base">No companies found</p>
        <p className="text-muted-foreground text-sm">
          You don't have any companies yet in workspace.
        </p>
      </div>
      <Button size="sm" onClick={() => router.push("/settings/integrations")}>
        Add integration
      </Button>
    </div>
  );
};

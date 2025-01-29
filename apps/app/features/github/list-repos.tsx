import { listRepositories } from "@/client/github/listRepositories";
import { useUser } from "@/context/userContext";
import type { installGithub } from "@conquest/trigger/tasks/installGithub.trigger";
import { Button } from "@conquest/ui/button";
import { Checkbox } from "@conquest/ui/checkbox";
import { cn } from "@conquest/ui/cn";
import { Separator } from "@conquest/ui/separator";
import { useRealtimeTaskTrigger } from "@trigger.dev/react-hooks";
import { useRouter } from "next/navigation";
import { type Dispatch, type SetStateAction, useEffect, useState } from "react";
import { toast } from "sonner";
import { LoadingChannels } from "../integrations/loading-channels";
import { LoadingMessage } from "../integrations/loading-message";

type Props = {
  loading: boolean;
  setLoading: Dispatch<SetStateAction<boolean>>;
};

export const ListRepos = ({ loading, setLoading }: Props) => {
  const { github } = useUser();
  const [selectedRepos, setSelectedRepos] = useState<string[]>([]);
  const router = useRouter();

  const { submit, run, error } = useRealtimeTaskTrigger<typeof installGithub>(
    "install-github",
    { accessToken: github?.trigger_token },
  );

  const { repositories, isLoading } = listRepositories();

  const onSelect = (repo: string) => {
    if (!repo) return;

    setSelectedRepos((prev) =>
      prev.includes(repo) ? prev.filter((id) => id !== repo) : [...prev, repo],
    );
  };

  const onSubmit = () => {
    if (!github) return;
    setLoading(true);
    submit({ github, repos: selectedRepos });
  };

  useEffect(() => {
    if (!run?.status) return;

    const isCompleted = run.status === "COMPLETED";
    const isFailed = run.status === "FAILED";

    if (isFailed || error) {
      router.refresh();
      toast.error("Failed to install GitHub", { duration: 5000 });
    }

    if (isCompleted) router.refresh();
  }, [run]);

  return (
    <>
      <Separator className="my-4" />
      <div className="space-y-4">
        <p className="font-medium text-base">Repositories</p>
        {isLoading ? (
          <LoadingChannels />
        ) : (
          <>
            <div className="flex flex-col gap-1">
              {repositories?.map((repo) => {
                return (
                  <button
                    key={repo.id}
                    type="button"
                    className={cn(
                      "flex items-center gap-2",
                      loading && "opacity-50",
                    )}
                    onClick={() => onSelect(repo.name)}
                  >
                    <Checkbox
                      checked={selectedRepos.includes(repo.name)}
                      disabled={loading}
                    />
                    <p>{repo.name}</p>
                  </button>
                );
              })}
            </div>
            {loading && <LoadingMessage />}
            <Button
              loading={loading}
              disabled={selectedRepos.length === 0 || loading}
              onClick={onSubmit}
            >
              Let's start!
            </Button>
          </>
        )}
      </div>
    </>
  );
};

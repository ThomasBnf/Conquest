import { useIntegration } from "@/context/integrationContext";
import type { installGithub } from "@conquest/trigger/tasks/installGithub";
import { Separator } from "@conquest/ui/separator";
import { useRealtimeTaskTrigger } from "@trigger.dev/react-hooks";
import { useRouter } from "next/navigation";
import { type Dispatch, type SetStateAction, useEffect } from "react";
import { toast } from "sonner";

type Props = {
  loading: boolean;
  setLoading: Dispatch<SetStateAction<boolean>>;
};

export const GithubForm = ({ loading, setLoading }: Props) => {
  const { github } = useIntegration();
  // const [repository, setRepository] = useState<Repository | null>(null);
  const router = useRouter();

  const { submit, run, error } = useRealtimeTaskTrigger<typeof installGithub>(
    "install-github",
    { accessToken: github?.trigger_token },
  );

  // const { repositories, isLoading } = listRepositories();

  const onSubmit = async () => {
    // if (!github || !repository) return;

    setLoading(true);
    // const reponse = await updateIntegration({
    //   id: github.id,
    //   status: "SYNCING",
    //   details: {
    //     ...github.details,
    //     name: repository.name,
    //     owner: repository.owner.login,
    //   },
    // });
    // const updatedGithub = GithubIntegrationSchema.parse(reponse?.data);
    // submit({ github: updatedGithub });
  };

  useEffect(() => {
    if (!run?.status) return;

    const isCompleted = run.status === "COMPLETED";
    const isFailed = run.status === "FAILED";

    if (isFailed || error) {
      router.refresh();
      setLoading(false);
      toast.error("Failed to install GitHub", { duration: 5000 });
    }

    if (isCompleted) router.refresh();
  }, [run]);

  return (
    <>
      <Separator className="my-4" />
      <div className="space-y-4">
        <p className="font-medium text-base">Repositories</p>
        {/* {isLoading ? (
          <LoadingChannels />
        ) : (
          <>
            <RadioGroup className="gap-2">
              {repositories?.map((repo) => (
                <div
                  key={repo.id}
                  className={cn(
                    "relative flex w-full items-start gap-2 rounded-md border p-4",
                    repository?.id === repo.id && "bg-muted",
                  )}
                >
                  <RadioGroupItem
                    value={repo.id.toString()}
                    className="order-1 after:absolute after:inset-0"
                    onClick={() => setRepository(repo)}
                  />
                  <div className="grid grow gap-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor={`repo-${repo.id}`}>{repo.name}</Label>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <p>{repo.stargazers_count}</p>
                        <Star
                          size={16}
                          className={cn(
                            "-translate-y-px",
                            repo.stargazers_count > 0 &&
                              "fill-[#E3B341] text-[#E3B341]",
                          )}
                        />
                      </div>
                    </div>
                    <p
                      id={`repo-${repo.id}-description`}
                      className="text-muted-foreground text-xs "
                    >
                      {repo.description || "No description available"}
                    </p>
                  </div>
                </div>
              ))}
            </RadioGroup>
            {loading ? (
              <LoadingMessage />
            ) : (
              <Button
                loading={loading}
                disabled={!repository || loading}
                onClick={onSubmit}
              >
                Let's start!
              </Button>
            )}
          </>
        )} */}
      </div>
    </>
  );
};

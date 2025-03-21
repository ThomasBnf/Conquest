import { LoadingRepositories } from "@/components/states/loading-repositories";
import { GITHUB_ACTIVITY_TYPES } from "@/constant";
import { useIntegration } from "@/context/integrationContext";
import { trpc } from "@/server/client";
import { Button } from "@conquest/ui/button";
import { cn } from "@conquest/ui/cn";
import { Input } from "@conquest/ui/input";
import { Label } from "@conquest/ui/label";
import { RadioGroup, RadioGroupItem } from "@conquest/ui/radio-group";
import type { Endpoints } from "@octokit/types";
import { ArrowRight, Loader2, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type Repository = Endpoints["GET /user/repos"]["response"]["data"][number];

export const GithubRepo = () => {
  const { github, setStep } = useIntegration();
  const [loading, setLoading] = useState(false);
  const [repository, setRepository] = useState<Repository | null>(null);
  const [search, setSearch] = useState("");

  const utils = trpc.useUtils();
  const { data, isLoading } = trpc.github.listRepositories.useQuery();
  const repositories = data?.filter((repo) =>
    repo.name.toLowerCase().includes(search.toLowerCase()),
  );

  const { mutateAsync } = trpc.integrations.update.useMutation({
    onSuccess: () => {
      utils.integrations.bySource.invalidate({
        source: "Github",
      });
    },
    onError: (error) => {
      toast.error(error.message);
      setLoading(false);
    },
  });

  const { mutateAsync: createManyActivityTypes } =
    trpc.activityTypes.postMany.useMutation({
      onSuccess: () => {
        utils.activityTypes.list.invalidate();
        setTimeout(() => {
          setLoading(false);
          setStep(1);
        }, 300);
      },
    });

  const onClick = async () => {
    if (!github || !repository) return;

    setLoading(true);

    await mutateAsync({
      id: github.id,
      details: {
        ...github.details,
        repo: repository.name,
        owner: repository.owner.login,
      },
    });

    await createManyActivityTypes({ activity_types: GITHUB_ACTIVITY_TYPES });
  };

  useEffect(() => {
    if (github?.details.repo) setStep(1);
  }, [github]);

  if (isLoading) return <LoadingRepositories />;

  return (
    <>
      <Input
        placeholder="Search for a repository"
        className="mb-2"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
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
              disabled={loading}
            />
            <div className="grid grow gap-1">
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
                className="text-muted-foreground"
              >
                {repo.description || "No description available"}
              </p>
            </div>
          </div>
        ))}
      </RadioGroup>
      <Button
        onClick={onClick}
        disabled={!repository || loading}
        className="mt-2"
      >
        {loading ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <>
            Next
            <ArrowRight size={16} />
          </>
        )}
      </Button>
    </>
  );
};

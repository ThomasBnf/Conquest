import { trpc } from "@/server/client";

type Props = {
  mappedColumns: Record<string, string>;
};

export const getValidationError = ({ mappedColumns }: Props) => {
  const mappedValues = Object.values(mappedColumns);

  const hasDiscordId = mappedValues.includes("discordId");
  const hasGithubLogin = mappedValues.includes("githubLogin");
  const hasSlackId = mappedValues.includes("slackId");

  const { data: discord } = trpc.integrations.bySource.useQuery({
    source: "Discord",
  });

  const { data: github } = trpc.integrations.bySource.useQuery({
    source: "Github",
  });

  const { data: slack } = trpc.integrations.bySource.useQuery({
    source: "Slack",
  });

  const validationErrors = [];

  const uniqueValues = new Set(mappedValues);

  if (uniqueValues.size !== mappedValues.length) {
    validationErrors.push("Cannot map multiple columns to the same attribute");
  }

  if (hasDiscordId && !discord) {
    validationErrors.push(
      "You must must connect Discord integration first to import Discord profiles",
    );
  }

  if (hasGithubLogin && !github) {
    validationErrors.push(
      "You must must connect Github integration first to import Github profiles",
    );
  }

  if (hasSlackId && !slack) {
    validationErrors.push(
      "You must must connect Slack integration first to import Slack profiles",
    );
  }

  return {
    isValid: validationErrors.length === 0,
    errors: validationErrors,
  };
};

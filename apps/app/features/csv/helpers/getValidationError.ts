type Props = {
  mappedColumns: Record<string, string>;
};

export const getValidationError = ({ mappedColumns }: Props) => {
  const mappedValues = Object.values(mappedColumns);

  const hasDiscordId = mappedValues.includes("discordId");
  const hasDiscordUsername = mappedValues.includes("discordUsername");

  const githubLogin = mappedValues.includes("githubLogin");
  const githubBio = mappedValues.includes("githubBio");
  const githubFollowers = mappedValues.includes("githubFollowers");
  const githubLocation = mappedValues.includes("githubLocation");

  const hasSlackId = mappedValues.includes("slackId");
  const hasSlackRealName = mappedValues.includes("slackRealName");

  const validationErrors = [];

  const uniqueValues = new Set(mappedValues);

  if (uniqueValues.size !== mappedValues.length) {
    validationErrors.push("Cannot map multiple columns to the same attribute");
  }

  if (!hasDiscordId && hasDiscordUsername) {
    validationErrors.push("Discord ID is required to import Discord profile");
  }

  if (hasDiscordId && !hasDiscordUsername) {
    validationErrors.push(
      "Discord Username is required to import Discord profile",
    );
  }

  if (!githubLogin && (githubBio || githubFollowers || githubLocation)) {
    validationErrors.push("GitHub Login is required to import GitHub profile");
  }

  if (!hasSlackId && hasSlackRealName) {
    validationErrors.push("Slack ID is required to import Slack profile");
  }

  if (hasSlackId && !hasSlackRealName) {
    validationErrors.push(
      "Slack Real Name is required to import Slack profile",
    );
  }
  return {
    isValid: validationErrors.length === 0,
    errors: validationErrors,
  };
};

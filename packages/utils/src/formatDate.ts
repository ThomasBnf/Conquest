import { formatDistanceToNowStrict } from "date-fns";

export const formatDate = (date?: Date | null) => {
  if (!date) return null;
  return formatDistanceToNowStrict(date, { addSuffix: true });
};

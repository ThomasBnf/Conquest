import { formatDistanceToNow } from "date-fns";

export const formatDate = (date?: Date | null) => {
  if (!date) return "";
  return formatDistanceToNow(date, { addSuffix: true });
};

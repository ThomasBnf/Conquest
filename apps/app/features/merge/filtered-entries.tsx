import { LocationBadge } from "@/components/custom/location-badge";
import { SourceBadge } from "@/components/custom/source-badge";
import { cn } from "@conquest/ui/src/utils/cn";
import type { Source } from "@conquest/zod/schemas/enum/source.enum";
import type { MemberWithCompany } from "@conquest/zod/schemas/member.schema";
import { format } from "date-fns";

type Props = {
  member: MemberWithCompany;
};

export const FilteredEntries = ({ member }: Props) => {
  const entries = [
    ["primary_email", member.primary_email],
    ["job_title", member.job_title],
    ["company_name", member.company_name],
    ["location", member.location],
    ["source", member.source],
    ["created_at", member.created_at],
  ];

  return entries.map(([key, value]) => {
    switch (key) {
      case "location": {
        return (
          <div className="space-y-1">
            <p className="text-muted-foreground text-xs capitalize">Location</p>
            {value ? (
              <LocationBadge location={value as string} />
            ) : (
              <p className="text-muted-foreground">N/A</p>
            )}
          </div>
        );
      }
      case "source": {
        return (
          <div className="space-y-1">
            <p className="text-muted-foreground text-xs capitalize">Source</p>
            <SourceBadge source={value as Source} />
          </div>
        );
      }
      case "created_at": {
        return (
          <div className="space-y-1">
            <p className="text-muted-foreground text-xs capitalize">
              Created at
            </p>
            <p>{format(value as Date, "PP, HH'h'mm")}</p>
          </div>
        );
      }
      default:
        return (
          <div className="space-y-1">
            <p className="text-muted-foreground text-xs capitalize">
              {String(key)?.replaceAll("_", " ")}
            </p>
            <p
              className={cn(
                value ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {value?.toString() ?? "N/A"}
            </p>
          </div>
        );
    }
  });
};

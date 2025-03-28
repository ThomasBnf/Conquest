import { SourceBadge } from "@/components/badges/source-badge";
import { trpc } from "@/server/client";
import { cn } from "@conquest/ui/cn";
import type { Source } from "@conquest/zod/enum/source.enum";
import type { Member } from "@conquest/zod/schemas/member.schema";
import { format } from "date-fns";

type Props = {
  member: Member;
};

export const FilteredEntries = ({ member }: Props) => {
  const entries = [
    ["primary_email", member.primary_email],
    ["job_title", member.job_title],
    ["company", member.company_id],
    ["source", member.source],
    ["first_activity", member.first_activity],
  ];

  const { data: company } = trpc.companies.get.useQuery({
    id: member.company_id ?? "",
  });

  return entries.map(([key, value], index) => {
    switch (key) {
      case "company": {
        return (
          <div key={index} className="space-y-1">
            <p className="text-muted-foreground text-xs capitalize">Company</p>
            {value ? (
              <p>{company?.name}</p>
            ) : (
              <p className="text-muted-foreground">N/A</p>
            )}
          </div>
        );
      }
      case "source": {
        return (
          <div key={index} className="space-y-1">
            <p className="text-muted-foreground text-xs capitalize">Source</p>
            <SourceBadge source={value as Source} />
          </div>
        );
      }
      case "first_activity": {
        return (
          <div key={index} className="space-y-1">
            <p className="text-muted-foreground text-xs capitalize">
              First activity
            </p>
            {value ? (
              <p>{format(value as Date, "PP, HH'h'mm")}</p>
            ) : (
              <p className="text-muted-foreground">N/A</p>
            )}
          </div>
        );
      }
      default:
        return (
          <div key={index} className="space-y-1">
            <p className="text-muted-foreground text-xs capitalize">
              {String(key)?.replaceAll("_", " ")}
            </p>
            <p
              className={cn(
                value ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {value && String(value).trim() !== "" ? value.toString() : "N/A"}
            </p>
          </div>
        );
    }
  });
};

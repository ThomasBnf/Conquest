import { trpc } from "@/server/client";
import { ProfileIconParser } from "@/utils/profile-icon-parser";
import { Avatar, AvatarFallback, AvatarImage } from "@conquest/ui/avatar";
import { cn } from "@conquest/ui/cn";
import type { Member } from "@conquest/zod/schemas/member.schema";
import { Profile } from "@conquest/zod/schemas/profile.schema";
import { skipToken } from "@tanstack/react-query";

type Props = {
  member: Member | null;
  profiles: Profile[] | undefined;
  className?: string;
};

export const MemberCard = ({ member, profiles, className }: Props) => {
  if (!member) return null;

  const {
    avatar_url,
    first_name,
    last_name,
    company_id,
    primary_email,
    job_title,
    linkedin_url,
    secondary_emails,
    phones,
  } = member;

  const entries = [
    ["avatar_url", avatar_url],
    ["full_name", `${first_name} ${last_name}`],
    ["primary_email", primary_email],
    ["company", company_id],
    ["job_title", job_title],
    ["linkedin_url", linkedin_url],
    ["secondary_emails", secondary_emails],
    ["phones", phones],
  ];

  const { data: company } = trpc.companies.get.useQuery(
    company_id ? { id: company_id } : skipToken,
  );

  return (
    <div
      className={cn(
        "flex w-80 shrink-0 flex-col divide-y rounded-md border bg-background",
        className,
      )}
    >
      <div className="flex flex-1 flex-col gap-4 p-4">
        {entries.map(([key, value]) => {
          switch (key) {
            case "avatar_url": {
              return (
                <Avatar key={key} className="size-9">
                  <AvatarImage src={avatar_url} />
                  <AvatarFallback className="text-sm">
                    {first_name?.charAt(0).toUpperCase()}
                    {last_name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              );
            }
            case "full_name": {
              if (value === "") return;
              return (
                <div key={key} className="space-y-1">
                  <p className="text-muted-foreground text-xs">Full name</p>
                  <p>{value}</p>
                </div>
              );
            }
            case "primary_email": {
              if (value === "") return;
              return (
                <div key={key} className="space-y-1">
                  <p className="text-muted-foreground text-xs">Primary email</p>
                  <p>{value}</p>
                </div>
              );
            }
            case "company": {
              if (value === null) return;
              return (
                <div key={key} className="space-y-1">
                  <p className="text-muted-foreground text-xs capitalize">
                    Company
                  </p>
                  <p>{company?.name}</p>
                </div>
              );
            }
            case "job_title": {
              if (value === "") return;
              return (
                <div key={key} className="space-y-1">
                  <p className="text-muted-foreground text-xs">Job title</p>
                  <p>{value}</p>
                </div>
              );
            }
            case "linkedin_url": {
              if (value === "") return;
              return (
                <div key={key} className="space-y-1">
                  <p className="text-muted-foreground text-xs">LinkedIn URL</p>
                  <p>{value}</p>
                </div>
              );
            }
            case "secondary_emails": {
              const secondaryEmails = value as string[];
              if (secondaryEmails.length === 0) return;
              return (
                <div key={key} className="space-y-1">
                  <p className="text-muted-foreground text-xs">
                    Secondary emails
                  </p>
                  <p>{secondaryEmails.join(", ")}</p>
                </div>
              );
            }
            case "phones": {
              const phones = value as string[];
              if (phones.length === 0) return;
              return (
                <div key={key} className="space-y-1">
                  <p className="text-muted-foreground text-xs">Phones</p>
                  <p>{phones.join(", ")}</p>
                </div>
              );
            }
          }
        })}
        <div className="space-y-2">
          <p className="text-muted-foreground text-xs">Profiles</p>
          <div className="flex items-center gap-2">
            {profiles
              ?.sort((a, b) =>
                a.attributes.source.localeCompare(b.attributes.source),
              )
              .map((profile) => (
                <div
                  key={profile.id}
                  className="rounded-md border bg-background p-1"
                >
                  <ProfileIconParser profile={profile} />
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

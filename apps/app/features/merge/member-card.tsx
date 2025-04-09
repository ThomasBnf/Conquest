import { CountryBadge } from "@/components/badges/country-badge";
import { LanguageBadge } from "@/components/badges/language-badge";
import { trpc } from "@/server/client";
import { ProfileIconParser } from "@/utils/profile-icon-parser";
import { Avatar, AvatarFallback, AvatarImage } from "@conquest/ui/avatar";
import { Button } from "@conquest/ui/button";
import { cn } from "@conquest/ui/cn";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@conquest/ui/dialog";
import type { Member } from "@conquest/zod/schemas/member.schema";
import { Profile } from "@conquest/zod/schemas/profile.schema";
import { skipToken } from "@tanstack/react-query";
import { format } from "date-fns";
import { ExternalLink } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { LevelBadge } from "../members/level-badge";
import { PulseBadge } from "../members/pulse-badge";

type Props = {
  member: Member | null;
  profiles: Profile[] | undefined;
  className?: string;
};

export const MemberCard = ({ member, profiles, className }: Props) => {
  const { data: session } = useSession();
  const { slug } = session?.user?.workspace ?? {};

  if (!member) return null;

  const {
    id,
    avatar_url,
    first_name,
    last_name,
    company_id,
    emails,
    job_title,
    linkedin_url,
    country,
    language,
    phones,
    created_at,
    first_activity,
  } = member;

  const entries = [
    ["avatar_url", avatar_url],
    ["full_name", `${first_name} ${last_name}`],
    ["emails", emails],
    ["company", company_id],
    ["job_title", job_title],
    ["linkedin_url", linkedin_url],
    ["phones", phones],
    ["country", country],
    ["language", language],
  ];

  const { data: company } = trpc.companies.get.useQuery(
    company_id ? { id: company_id } : skipToken,
  );

  return (
    <div
      className={cn(
        "relative flex h-fit w-80 shrink-0 flex-col rounded-md border bg-background hover:bg-sidebar",
        className,
      )}
    >
      <Link
        href={`/${slug}/members/${id}/analytics`}
        className="absolute top-2 right-2"
        prefetch
        scroll
      >
        <Button variant="outline" size="icon">
          <ExternalLink size={16} />
        </Button>
      </Link>
      <div className="flex flex-1 flex-col gap-4 p-4">
        {entries.map(([key, value]) => {
          switch (key) {
            case "avatar_url": {
              return (
                <div key={`${key}-${id}`}>
                  <div className="flex items-center gap-2">
                    <Dialog>
                      <DialogTrigger asChild className="cursor-zoom-in">
                        <Avatar className="size-9">
                          <AvatarImage src={avatar_url} />
                          <AvatarFallback className="text-sm">
                            {first_name?.charAt(0).toUpperCase()}
                            {last_name?.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </DialogTrigger>
                      <DialogContent className="max-w-fit">
                        <DialogHeader>
                          <DialogTitle>{`${first_name} ${last_name}`}</DialogTitle>
                        </DialogHeader>
                        <DialogBody className="mb-0.5 flex items-center justify-center">
                          <Avatar className="size-96">
                            <AvatarImage src={avatar_url} />
                            <AvatarFallback className="text-sm">
                              {first_name?.charAt(0).toUpperCase()}
                              {last_name?.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        </DialogBody>
                      </DialogContent>
                    </Dialog>
                    {first_activity ? (
                      <div>
                        <p className="text-muted-foreground text-xs">
                          First activity
                        </p>
                        <p>{format(first_activity, "PPp")}</p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-muted-foreground text-xs">
                          Created at
                        </p>
                        <p>{format(created_at, "PPp")}</p>
                      </div>
                    )}
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <LevelBadge member={member} />
                    <PulseBadge member={member} />
                  </div>
                </div>
              );
            }
            case "full_name": {
              if (value === "") return;
              return (
                <div key={`${key}-${id}`} className="space-y-1">
                  <p className="text-muted-foreground text-xs">Full name</p>
                  <p>{value}</p>
                </div>
              );
            }
            case "emails": {
              const emails = value as string[];
              if (emails.length === 0) return;
              return (
                <div key={`${key}-${id}`} className="space-y-1">
                  <p className="text-muted-foreground text-xs">Emails</p>
                  <p>{emails.join(", ")}</p>
                </div>
              );
            }
            case "company": {
              if (value === null) return;
              return (
                <div key={`${key}-${id}`} className="space-y-1">
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
                <div key={`${key}-${id}`} className="space-y-1">
                  <p className="text-muted-foreground text-xs">Job title</p>
                  <p className="truncate">{value}</p>
                </div>
              );
            }
            case "linkedin_url": {
              if (value === "") return;
              return (
                <div key={`${key}-${id}`} className="space-y-1">
                  <p className="text-muted-foreground text-xs">LinkedIn URL</p>
                  <p className="truncate">{value}</p>
                </div>
              );
            }
            case "phones": {
              const phones = value as string[];
              if (phones.length === 0) return;
              return (
                <div key={`${key}-${id}`} className="space-y-1">
                  <p className="text-muted-foreground text-xs">Phones</p>
                  <p>{phones.join(", ")}</p>
                </div>
              );
            }
            case "country": {
              if (value === "") return;
              return (
                <div key={`${key}-${id}`} className="space-y-1">
                  <p className="text-muted-foreground text-xs">Country</p>
                  <CountryBadge country={value as string} />
                </div>
              );
            }
            case "language": {
              if (value === "") return;
              return (
                <div key={`${key}-${id}`} className="space-y-1">
                  <p className="text-muted-foreground text-xs">Language</p>
                  <LanguageBadge language={value as string} />
                </div>
              );
            }
          }
        })}
        {profiles && profiles.length > 0 && (
          <div className="space-y-2">
            <p className="text-muted-foreground text-xs">Profiles</p>
            <div className="space-y-1">
              {profiles
                ?.sort((a, b) =>
                  a.attributes.source.localeCompare(b.attributes.source),
                )
                .map((profile) => (
                  <ProfileIconParser
                    key={profile.id}
                    profile={profile}
                    displayUsername
                  />
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

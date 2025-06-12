import { CountryBadge } from "@/components/badges/country-badge";
import { LanguageBadge } from "@/components/badges/language-badge";
import { useWorkspace } from "@/hooks/useWorkspace";
import { trpc } from "@/server/client";
import { ProfileIconParser } from "@/utils/profile-icon-parser";
import { Avatar, AvatarFallback, AvatarImage } from "@conquest/ui/avatar";
import { Button } from "@conquest/ui/button";
import { Checkbox } from "@conquest/ui/checkbox";
import { cn } from "@conquest/ui/cn";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@conquest/ui/dialog";
import { Skeleton } from "@conquest/ui/skeleton";
import type { MemberWithProfiles } from "@conquest/zod/schemas/member.schema";
import { skipToken } from "@tanstack/react-query";
import { format } from "date-fns";
import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { LevelBadge } from "../members/level-badge";
import { PulseBadge } from "../members/pulse-badge";

type Props = {
  memberChecked: {
    member: MemberWithProfiles;
    checked: boolean;
  };
  onCheckChange: (id: string, checked: boolean) => void;
};

export const MemberCard = ({ memberChecked, onCheckChange }: Props) => {
  const { slug } = useWorkspace();
  const { member, checked } = memberChecked;

  const {
    id,
    avatarUrl,
    firstName,
    lastName,
    companyId,
    emails,
    jobTitle,
    linkedinUrl,
    country,
    language,
    phones,
    createdAt,
    firstActivity,
    profiles,
  } = member;

  const entries = [
    ["avatarUrl", avatarUrl],
    ["emails", emails],
    ["company", companyId],
    ["jobTitle", jobTitle],
    ["linkedinUrl", linkedinUrl],
    ["phones", phones],
    ["country", country],
    ["language", language],
  ];

  const { data: company, isLoading } = trpc.companies.get.useQuery(
    companyId ? { id: companyId } : skipToken,
  );

  return (
    <div
      className={cn(
        "flex h-fit w-80 shrink-0 flex-col divide-y rounded-md border",
        checked ? "bg-sidebar" : "bg-background",
      )}
    >
      <div className="flex items-center justify-between py-2 pl-4 pr-2 overflow-hidden">
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => onCheckChange(id, !checked)}
        >
          <Checkbox checked={checked} />
          <p className="font-medium truncate">
            {firstName} {lastName}
          </p>
        </div>
        <Link href={`/${slug}/members/${id}/analytics`} prefetch>
          <Button variant="outline" size="icon">
            <ExternalLink size={16} />
          </Button>
        </Link>
      </div>
      <div className="flex flex-col flex-1 gap-4 p-4 truncate">
        {entries.map(([key, value]) => {
          switch (key) {
            case "avatarUrl": {
              return (
                <div key={`${key}-${id}`}>
                  <div className="flex items-center gap-2">
                    <Dialog>
                      <DialogTrigger asChild className="cursor-zoom-in">
                        <Avatar className="size-9">
                          <AvatarImage src={avatarUrl} />
                          <AvatarFallback className="text-sm">
                            {firstName?.charAt(0).toUpperCase()}
                            {lastName?.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </DialogTrigger>
                      <DialogContent className="max-w-fit">
                        <DialogHeader>
                          <DialogTitle>{`${firstName} ${lastName}`}</DialogTitle>
                        </DialogHeader>
                        <DialogBody className="mb-0.5 flex items-center justify-center">
                          <Avatar className="size-96">
                            <AvatarImage src={avatarUrl} />
                            <AvatarFallback className="text-sm">
                              {firstName?.charAt(0).toUpperCase()}
                              {lastName?.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        </DialogBody>
                      </DialogContent>
                    </Dialog>
                    {firstActivity ? (
                      <div>
                        <p className="text-xs text-muted-foreground">
                          First activity
                        </p>
                        <p>{format(firstActivity, "PPp")}</p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Created at
                        </p>
                        <p>{format(createdAt, "PPp")}</p>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <LevelBadge member={member} />
                    <PulseBadge member={member} />
                  </div>
                </div>
              );
            }
            case "emails": {
              const emails = value as string[];
              if (emails.length === 0) return;

              return (
                <div key={`${key}-${id}`} className="space-y-1">
                  <p className="text-xs text-muted-foreground">Emails</p>
                  {emails.map((email) => (
                    <p key={email}>{email}</p>
                  ))}
                </div>
              );
            }
            case "company": {
              if (value === null) return;
              return (
                <div key={`${key}-${id}`} className="space-y-1">
                  <p className="text-xs capitalize text-muted-foreground">
                    Company
                  </p>
                  {isLoading ? (
                    <Skeleton className="w-24 h-5" />
                  ) : (
                    <p>{company?.name}</p>
                  )}
                </div>
              );
            }
            case "jobTitle": {
              if (value === "") return;
              return (
                <div key={`${key}-${id}`} className="space-y-1">
                  <p className="text-xs text-muted-foreground">Job title</p>
                  <p className="truncate">{value}</p>
                </div>
              );
            }
            case "linkedinUrl": {
              if (value === "") return;
              return (
                <div key={`${key}-${id}`} className="space-y-1">
                  <p className="text-xs text-muted-foreground">LinkedIn URL</p>
                  <p className="truncate">{value}</p>
                </div>
              );
            }
            case "phones": {
              const phones = value as string[];
              if (phones.length === 0) return;
              return (
                <div key={`${key}-${id}`} className="space-y-1">
                  <p className="text-xs text-muted-foreground">Phones</p>
                  <p>{phones.join(", ")}</p>
                </div>
              );
            }
            case "country": {
              if (value === "") return;
              return (
                <div key={`${key}-${id}`} className="space-y-1">
                  <p className="text-xs text-muted-foreground">Country</p>
                  <CountryBadge country={value as string} />
                </div>
              );
            }
            case "language": {
              if (value === "") return;
              return (
                <div key={`${key}-${id}`} className="space-y-1">
                  <p className="text-xs text-muted-foreground">Language</p>
                  <LanguageBadge language={value as string} />
                </div>
              );
            }
          }
        })}
        {profiles && profiles.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Profiles</p>
            <div className="flex flex-col gap-1">
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

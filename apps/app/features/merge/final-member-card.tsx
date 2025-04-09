import { CountryBadge } from "@/components/badges/country-badge";
import { LanguageBadge } from "@/components/badges/language-badge";
import { ProfileIconParser } from "@/utils/profile-icon-parser";
import { Avatar, AvatarFallback, AvatarImage } from "@conquest/ui/avatar";
import { Button } from "@conquest/ui/button";
import { Checkbox } from "@conquest/ui/checkbox";
import { cn } from "@conquest/ui/cn";
import { RadioGroup, RadioGroupItem } from "@conquest/ui/radio-group";
import { ScrollArea } from "@conquest/ui/scroll-area";
import { Separator } from "@conquest/ui/separator";
import { Member } from "@conquest/zod/schemas/member.schema";
import { Profile } from "@conquest/zod/schemas/profile.schema";
import { Maximize2, Minimize2 } from "lucide-react";
import { useState } from "react";
import { CompanyKey } from "./company-key";
import { getUniqueValues } from "./helpers/getUniqueValues";

type Props = {
  members: Member[];
  finalMember: Member | null;
  setFinalMember: (member: Member) => void;
  profiles: Profile[] | undefined;
};

export const FinalMemberCard = ({
  members,
  finalMember,
  setFinalMember,
  profiles,
}: Props) => {
  const [isMaximized, setIsMaximized] = useState(false);

  const keys = [
    "avatar_url",
    "full_name",
    "emails",
    "company_id",
    "job_title",
    "linkedin_url",
    "phones",
    "country",
    "language",
  ];

  if (!finalMember) return null;

  return (
    <div
      className={cn(
        "flex h-full min-w-80 shrink-0 flex-col overflow-hidden rounded-md border",
        isMaximized ? "h-fit max-h-[50vh]" : "h-fit max-h-[80vh]",
      )}
    >
      <div className="flex items-center justify-between bg-sidebar p-2">
        <p className="font-medium">Final member</p>
        <Button
          variant="outline"
          size="icon_sm"
          onClick={() => setIsMaximized(!isMaximized)}
        >
          {isMaximized ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
        </Button>
      </div>
      <Separator />
      <ScrollArea>
        <div className="flex h-full w-fit flex-col gap-4 p-4">
          {keys.map((key) => {
            switch (key) {
              case "avatar_url": {
                const hasAvatarUrl = members.some(
                  (member) => member.avatar_url !== "",
                );

                if (!hasAvatarUrl) return;

                return (
                  <RadioGroup
                    key={key}
                    className="flex items-center gap-4"
                    onValueChange={(value) =>
                      setFinalMember({ ...finalMember, avatar_url: value })
                    }
                  >
                    {members.map((member) => {
                      const { id, first_name, last_name, avatar_url } = member;

                      return (
                        <div
                          key={`${id}-${avatar_url}`}
                          className="flex items-center gap-2"
                        >
                          <RadioGroupItem
                            value={avatar_url}
                            checked={finalMember?.avatar_url === avatar_url}
                          />
                          <Avatar className="size-9">
                            <AvatarImage src={avatar_url} />
                            <AvatarFallback className="text-sm">
                              <AvatarFallback className="text-sm">
                                {first_name?.charAt(0).toUpperCase()}
                                {last_name?.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </AvatarFallback>
                          </Avatar>
                        </div>
                      );
                    })}
                  </RadioGroup>
                );
              }
              case "full_name": {
                const { first_name, last_name } = finalMember;
                const full_name = `${first_name} ${last_name}`;

                const uniqueFullNames = members.reduce<
                  Array<{ id: string; fullName: string }>
                >((acc, member) => {
                  const memberFullName = `${member.first_name} ${member.last_name}`;
                  if (!acc.some((item) => item.fullName === memberFullName)) {
                    acc.push({ id: member.id, fullName: memberFullName });
                  }
                  return acc;
                }, []);

                return (
                  <RadioGroup
                    key={key}
                    value={full_name}
                    onValueChange={(value) =>
                      setFinalMember({
                        ...finalMember,
                        first_name: value.split(" ")[0] ?? "",
                        last_name: value.split(" ").slice(1).join(" ") ?? "",
                      })
                    }
                  >
                    <p className="text-muted-foreground text-xs">Full name</p>

                    {uniqueFullNames.map(({ id, fullName }) => (
                      <div
                        key={`${id}-${fullName}`}
                        className="flex items-center gap-2"
                      >
                        <RadioGroupItem value={fullName} />
                        <p>{fullName}</p>
                      </div>
                    ))}
                  </RadioGroup>
                );
              }
              case "emails": {
                const hasEmails = members.some(
                  (member) => member.emails.length > 0,
                );

                if (!hasEmails) return;

                return (
                  <div key={key} className="space-y-2">
                    <p className="text-muted-foreground text-xs">Emails</p>
                    <div className="space-y-1">
                      {members.map((member, memberIndex) => {
                        const { id, emails } = member;

                        if (emails.length === 0) return;

                        return (
                          <div
                            key={`member-${memberIndex}`}
                            className="space-y-1"
                          >
                            {emails.map((email) => (
                              <div
                                key={`${id}-${email}`}
                                className="flex items-center gap-2"
                              >
                                <Checkbox
                                  checked={finalMember.emails.includes(email)}
                                  onCheckedChange={(value) => {
                                    setFinalMember({
                                      ...finalMember,
                                      emails: value
                                        ? [...finalMember.emails, email]
                                        : finalMember.emails.filter(
                                            (e) => e !== email,
                                          ),
                                    });
                                  }}
                                />
                                <p>{email}</p>
                              </div>
                            ))}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              }
              case "company_id": {
                const hasCompanyId = members.some(
                  (member) => member.company_id !== null,
                );

                if (!hasCompanyId) return null;

                const uniqueCompanyIds = getUniqueValues({
                  items: members,
                  field: "company_id",
                });

                return (
                  <RadioGroup
                    key={key}
                    onValueChange={(value) =>
                      setFinalMember({ ...finalMember, company_id: value })
                    }
                  >
                    <p className="text-muted-foreground text-xs">Company</p>

                    {uniqueCompanyIds.map((member) => {
                      const { id, company_id } = member;

                      return (
                        <CompanyKey
                          key={`${id}-${company_id}`}
                          company_id={company_id}
                          finalMember={finalMember}
                          setFinalMember={setFinalMember}
                        />
                      );
                    })}
                  </RadioGroup>
                );
              }
              case "job_title": {
                const { job_title } = finalMember;

                const hasJobTitle = members.some(
                  (member) => member.job_title !== "",
                );

                if (!hasJobTitle) return;

                const uniqueJobTitles = getUniqueValues({
                  items: members,
                  field: "job_title",
                });

                return (
                  <RadioGroup
                    key={key}
                    value={job_title}
                    onValueChange={(value) =>
                      setFinalMember({ ...finalMember, job_title: value })
                    }
                  >
                    <p className="text-muted-foreground text-xs">Job title</p>

                    {uniqueJobTitles.map((member) => {
                      const { id, job_title } = member;

                      if (job_title === "") return;

                      return (
                        <div
                          key={`${id}-${job_title}`}
                          className="flex items-center gap-2"
                        >
                          <RadioGroupItem value={job_title} />
                          <p>{job_title}</p>
                        </div>
                      );
                    })}
                  </RadioGroup>
                );
              }
              case "linkedin_url": {
                const { linkedin_url } = finalMember;

                const hasLinkedinUrl = members.some(
                  (member) => member.linkedin_url !== "",
                );

                if (!hasLinkedinUrl) return;

                const uniqueLinkedinUrls = getUniqueValues({
                  items: members,
                  field: "linkedin_url",
                });

                return (
                  <RadioGroup
                    key={key}
                    value={linkedin_url}
                    onValueChange={(value) =>
                      setFinalMember({ ...finalMember, linkedin_url: value })
                    }
                  >
                    <p className="text-muted-foreground text-xs">
                      LinkedIn URL
                    </p>
                    {uniqueLinkedinUrls.map((member) => {
                      const { id, linkedin_url } = member;

                      if (linkedin_url === "") return;

                      return (
                        <div
                          key={`${id}-${linkedin_url}`}
                          className="flex items-center gap-2 overflow-hidden truncate"
                        >
                          <RadioGroupItem value={linkedin_url} />
                          <p key={linkedin_url}>{linkedin_url}</p>
                        </div>
                      );
                    })}
                  </RadioGroup>
                );
              }
              case "phones": {
                const hasPhones = members.some(
                  (member) => member.phones.length > 0,
                );

                if (!hasPhones) return;

                return (
                  <div key={key} className="space-y-2">
                    <p className="text-muted-foreground text-xs">Phones</p>
                    <div className="space-y-1">
                      {members.map((member, memberIndex) => {
                        const { id, phones } = member;

                        if (phones.length === 0) return;

                        return (
                          <div
                            key={`member-${memberIndex}`}
                            className="space-y-1"
                          >
                            {phones.map((phone) => (
                              <div
                                key={`${id}-${phone}`}
                                className="flex items-center gap-2"
                              >
                                <Checkbox
                                  checked={finalMember.phones.includes(phone)}
                                  onCheckedChange={(value) => {
                                    setFinalMember({
                                      ...finalMember,
                                      phones: value
                                        ? [...finalMember.phones, phone]
                                        : finalMember.phones.filter(
                                            (p) => p !== phone,
                                          ),
                                    });
                                  }}
                                />
                                <p>{phone}</p>
                              </div>
                            ))}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              }
              case "country": {
                const { country } = finalMember;

                const hasCountry = members.some(
                  (member) => member.country !== "",
                );

                if (!hasCountry) return;

                const uniqueCountries = getUniqueValues({
                  items: members,
                  field: "country",
                });

                return (
                  <RadioGroup
                    key={key}
                    value={country}
                    onValueChange={(value) =>
                      setFinalMember({ ...finalMember, country: value })
                    }
                  >
                    <p className="text-muted-foreground text-xs">Country</p>
                    {uniqueCountries.map((member) => {
                      const { id, country } = member;

                      if (country === "") return;

                      return (
                        <div
                          key={`${id}-${country}`}
                          className="flex items-center gap-2 overflow-hidden"
                        >
                          <RadioGroupItem value={country} />
                          <CountryBadge country={country} />
                        </div>
                      );
                    })}
                  </RadioGroup>
                );
              }
              case "language": {
                const { language } = finalMember;

                const hasLanguage = members.some(
                  (member) => member.language !== "",
                );

                if (!hasLanguage) return;

                const uniqueLanguages = getUniqueValues({
                  items: members,
                  field: "language",
                });

                return (
                  <RadioGroup
                    key={key}
                    value={language}
                    onValueChange={(value) =>
                      setFinalMember({ ...finalMember, language: value })
                    }
                  >
                    <p className="text-muted-foreground text-xs">Language</p>
                    {uniqueLanguages.map((member) => {
                      const { id, language } = member;

                      if (language === "") return;

                      return (
                        <div
                          key={`${id}-${language}`}
                          className="flex items-center gap-2 overflow-hidden"
                        >
                          <RadioGroupItem value={language} />
                          <LanguageBadge language={language} />
                        </div>
                      );
                    })}
                  </RadioGroup>
                );
              }
            }
          })}
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
        </div>
      </ScrollArea>
    </div>
  );
};

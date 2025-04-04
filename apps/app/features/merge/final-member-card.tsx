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

type Props = {
  members: Member[];
  allProfiles: Profile[] | undefined;
  finalMember: Member;
  setFinalMember: (member: Member) => void;
};

export const FinalMemberCard = ({
  members,
  allProfiles,
  finalMember,
  setFinalMember,
}: Props) => {
  const [isMaximized, setIsMaximized] = useState(true);

  const keys = [
    "avatar_url",
    "full_name",
    "primary_email",
    "company_id",
    "job_title",
    "linkedin_url",
    "secondary_emails",
    "phones",
  ];

  return (
    <div className="my-4 flex w-80 flex-col rounded-md border">
      <div className="flex items-center justify-between p-2">
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
      <ScrollArea className={cn(isMaximized ? "h-fit max-h-[80vh]" : "h-96")}>
        <div className="flex flex-col gap-4 p-4">
          {keys.map((key) => {
            switch (key) {
              case "avatar_url": {
                return (
                  <RadioGroup
                    key={key}
                    className="flex items-center gap-4"
                    onValueChange={(value) =>
                      setFinalMember({ ...finalMember, avatar_url: value })
                    }
                  >
                    {members.map((member) => {
                      const { first_name, last_name, avatar_url } = member;

                      return (
                        <div
                          key={avatar_url}
                          className="flex items-center gap-2"
                        >
                          <RadioGroupItem
                            value={avatar_url}
                            checked={finalMember?.avatar_url === avatar_url}
                          />
                          <Avatar key={avatar_url} className="size-9">
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

                return (
                  <RadioGroup
                    key={key}
                    value={full_name}
                    onValueChange={(value) =>
                      setFinalMember({
                        ...finalMember,
                        first_name: value.split(" ")[0] ?? "",
                        last_name: value.split(" ")[1] ?? "",
                      })
                    }
                  >
                    <p className="text-muted-foreground text-xs">Full name</p>

                    {members.map((member) => {
                      const { first_name, last_name } = member;
                      const full_name = `${first_name} ${last_name}`;

                      return (
                        <div
                          key={full_name}
                          className="flex items-center gap-2"
                        >
                          <RadioGroupItem value={full_name} />
                          <p key={full_name}>{full_name}</p>
                        </div>
                      );
                    })}
                  </RadioGroup>
                );
              }
              case "primary_email": {
                const { primary_email } = finalMember;
                return (
                  <RadioGroup
                    key={key}
                    value={primary_email}
                    onValueChange={(value) =>
                      setFinalMember({ ...finalMember, primary_email: value })
                    }
                  >
                    <p className="text-muted-foreground text-xs">
                      Primary email
                    </p>

                    {members.map((member) => {
                      const { primary_email } = member;

                      return (
                        <div
                          key={primary_email}
                          className="flex items-center gap-2"
                        >
                          <RadioGroupItem value={primary_email} />
                          <p key={primary_email}>{primary_email}</p>
                        </div>
                      );
                    })}
                  </RadioGroup>
                );
              }
              case "company_id": {
                const hasCompanyId = members.some(
                  (member) => member.company_id !== null,
                );

                if (!hasCompanyId) return null;

                return (
                  <RadioGroup
                    key={key}
                    onValueChange={(value) =>
                      setFinalMember({ ...finalMember, company_id: value })
                    }
                  >
                    <p className="text-muted-foreground text-xs">Company</p>

                    {members.map((member) => {
                      const { company_id } = member;

                      return (
                        <CompanyKey
                          key={company_id}
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

                return (
                  <RadioGroup
                    key={key}
                    value={job_title}
                    onValueChange={(value) =>
                      setFinalMember({ ...finalMember, job_title: value })
                    }
                  >
                    <p className="text-muted-foreground text-xs">Job title</p>

                    {members.map((member) => {
                      const { job_title } = member;

                      if (job_title === "") return;

                      return (
                        <div
                          key={job_title}
                          className="flex items-center gap-2"
                        >
                          <RadioGroupItem value={job_title} />
                          <p key={job_title}>{job_title}</p>
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

                    {members.map((member) => {
                      const { linkedin_url } = member;

                      if (linkedin_url === "") return;

                      return (
                        <div
                          key={linkedin_url}
                          className="flex items-center gap-2 overflow-hidden"
                        >
                          <RadioGroupItem value={linkedin_url} />
                          <p key={linkedin_url} className="truncate">
                            {linkedin_url}
                          </p>
                        </div>
                      );
                    })}
                  </RadioGroup>
                );
              }
              case "secondary_emails": {
                const hasSecondaryEmails = members.some(
                  (member) => member.secondary_emails.length > 0,
                );

                if (!hasSecondaryEmails) return;

                return (
                  <div key={key} className="space-y-2">
                    <p className="text-muted-foreground text-xs">
                      Secondary emails
                    </p>
                    {members.map((member, memberIndex) => {
                      const { secondary_emails } = member;

                      if (secondary_emails.length === 0) return;

                      return (
                        <div key={`member-${memberIndex}`}>
                          {secondary_emails.map((email) => (
                            <div
                              key={email}
                              className="flex items-center gap-2"
                            >
                              <Checkbox
                                checked={finalMember.secondary_emails.includes(
                                  email,
                                )}
                                onCheckedChange={(value) => {
                                  setFinalMember({
                                    ...finalMember,
                                    secondary_emails: value
                                      ? [...finalMember.secondary_emails, email]
                                      : finalMember.secondary_emails.filter(
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
                    {members.map((member, memberIndex) => {
                      const { phones } = member;

                      if (phones.length === 0) return;

                      return (
                        <div key={`member-${memberIndex}`}>
                          {phones.map((phone) => (
                            <div
                              key={phone}
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
                );
              }
            }
          })}
          <div className="space-y-2">
            <p className="text-muted-foreground text-xs">Profiles</p>
            <div className="flex items-center gap-2">
              {allProfiles
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
      </ScrollArea>
    </div>
  );
};

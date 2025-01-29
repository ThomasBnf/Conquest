import { CountryBadge } from "@/components/badges/country-badge";
import { LanguageBadge } from "@/components/badges/language-badge";
import { SourceBadge } from "@/components/badges/source-badge";
import { DateCell } from "@/components/custom/date-cell";
import { ColumnHeader } from "@/features/table/column-header";
import { TagsCell } from "@/features/table/tags-cell";
import { Avatar, AvatarFallback, AvatarImage } from "@conquest/ui/avatar";
import { buttonVariants } from "@conquest/ui/button";
import { Checkbox } from "@conquest/ui/checkbox";
import { cn } from "@conquest/ui/cn";
import type { MemberWithCompany } from "@conquest/zod/schemas/member.schema";
import type { Tag } from "@conquest/zod/schemas/tag.schema";
import Link from "next/link";
import type { Dispatch, SetStateAction } from "react";
import { LevelTooltip } from "../members/level-tooltip";
import { PulseTooltip } from "../members/pulse-tooltip";

type Column = {
  id: string;
  header: (args: {
    members?: MemberWithCompany[];
    rowSelected?: string[];
    setRowSelected?: Dispatch<SetStateAction<string[]>>;
  }) => React.ReactNode;
  cell: (args: {
    slug?: string;
    member: MemberWithCompany;
    rowSelected?: string[];
    setRowSelected?: Dispatch<SetStateAction<string[]>>;
  }) => React.ReactNode;
  width: number;
};

type Props = {
  tags: Tag[] | undefined;
};

export const MembersColumns = ({ tags }: Props): Column[] => [
  {
    id: "select",
    header: ({ members, rowSelected, setRowSelected }) => (
      <div className="flex size-12 items-center justify-center bg-muted">
        <Checkbox
          checked={
            !rowSelected?.length
              ? false
              : rowSelected.length === members?.length
                ? true
                : "indeterminate"
          }
          onClick={(e) => {
            e.stopPropagation();
            if (rowSelected?.length === members?.length) {
              setRowSelected?.([]);
            } else {
              setRowSelected?.(members?.map((member) => member.id) ?? []);
            }
          }}
        />
      </div>
    ),
    cell: ({ member, rowSelected, setRowSelected }) => (
      <Checkbox
        checked={rowSelected?.includes(member.id)}
        onCheckedChange={(checked) =>
          setRowSelected?.(
            checked
              ? [...(rowSelected ?? []), member.id]
              : (rowSelected ?? []).filter((id) => id !== member.id),
          )
        }
      />
    ),
    width: 40,
  },
  {
    id: "full_name",
    header: () => <ColumnHeader id="full_name" title="Full Name" width={285} />,
    cell: ({ slug, member }) => (
      <Link
        href={`/${slug}/members/${member.id}/analytics`}
        className={cn(
          buttonVariants({ variant: "ghost" }),
          "flex items-center gap-2 truncate px-1.5",
        )}
      >
        <Avatar className="size-6">
          <AvatarImage src={member.avatar_url ?? ""} />
          <AvatarFallback className="text-sm">
            {member.first_name?.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <p className="truncate font-medium">
          {member.first_name} {member.last_name}
        </p>
      </Link>
    ),
    width: 285,
  },
  {
    id: "company",
    header: () => <ColumnHeader id="company" title="Company" width={250} />,
    cell: ({ member }) => (
      <p className="truncate p-2">{member.company?.name}</p>
    ),
    width: 250,
  },
  {
    id: "tags",
    header: () => <ColumnHeader id="tags" title="Tags" width={250} />,
    cell: ({ member }) => {
      const memberTags = tags?.filter((tag) => member.tags?.includes(tag.id));

      return (
        <TagsCell
          id={member.id}
          initialTags={memberTags ?? []}
          table="members"
        />
      );
    },
    width: 250,
  },
  {
    id: "job_title",
    header: () => <ColumnHeader id="job_title" title="Job Title" width={250} />,
    cell: ({ member }) => <p className="truncate p-2">{member.job_title}</p>,
    width: 250,
  },
  {
    id: "level",
    header: () => <ColumnHeader id="level" title="Level" width={200} />,
    cell: ({ member }) => {
      return (
        <div className="flex w-full items-center justify-end p-2">
          <LevelTooltip member={member} />
        </div>
      );
    },
    width: 200,
  },
  {
    id: "pulse",
    header: () => <ColumnHeader id="pulse" title="Pulse" width={200} />,
    cell: ({ member }) => {
      return (
        <div className="flex w-full items-center justify-end p-2">
          <PulseTooltip member={member} />
        </div>
      );
    },
    width: 200,
  },
  {
    id: "last_activity",
    header: () => (
      <ColumnHeader id="last_activity" title="Last activity" width={250} />
    ),
    cell: ({ member }) => <DateCell date={member.last_activity} />,
    width: 250,
  },
  {
    id: "language",
    header: () => <ColumnHeader id="language" title="Language" width={250} />,
    cell: ({ member }) => (
      <div className="p-2">
        <LanguageBadge locale={member.locale} />
      </div>
    ),
    width: 250,
  },
  {
    id: "country",
    header: () => <ColumnHeader id="country" title="Country" width={250} />,
    cell: ({ member }) => (
      <div className="p-2">
        <CountryBadge locale={member.locale} />
      </div>
    ),
    width: 250,
  },
  {
    id: "emails",
    header: () => <ColumnHeader id="emails" title="Email" width={250} />,
    cell: ({ member }) => (
      <p className="truncate p-2">{member.primary_email}</p>
    ),
    width: 250,
  },
  {
    id: "first_activity",
    header: () => (
      <ColumnHeader id="first_activity" title="First activity" width={250} />
    ),
    cell: ({ member }) => <DateCell date={member.first_activity} />,
    width: 250,
  },
  {
    id: "created_at",
    header: () => (
      <ColumnHeader id="created_at" title="Created at" width={250} />
    ),
    cell: ({ member }) => <DateCell date={member.created_at} />,
    width: 250,
  },

  {
    id: "source",
    header: () => <ColumnHeader id="source" title="Source" width={250} />,
    cell: ({ member }) => (
      <SourceBadge source={member.source} className="m-2" />
    ),
    width: 250,
  },
];

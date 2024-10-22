import { MemberMenu } from "@/features/members/member-menu";
import { MemberSidebar } from "@/features/members/member-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@conquest/ui/breadcrumb";
import { ScrollArea } from "@conquest/ui/scroll-area";
import { GroupedActivities } from "features/activities/grouped-activities";
import { redirect } from "next/navigation";
import { getMember } from "queries/members/getMember";
import { listTags } from "queries/tags/listTags";

type Props = {
  params: {
    slug: string;
    memberId: string;
  };
};

export default async function Page({ params: { memberId, slug } }: Props) {
  const rMember = await getMember({ id: memberId });
  const member = rMember?.data;

  const rTags = await listTags();
  const tags = rTags?.data;

  if (!member) redirect(`/w/${slug}/members`);

  const { full_name } = member;

  return (
    <div className="flex h-full flex-col divide-y">
      <div className="flex h-12 items-center justify-between px-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href={`/w/${slug}/members`}>
                Members
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{full_name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <MemberMenu member={member} />
      </div>
      <div className="flex min-h-0 flex-1 divide-x">
        <ScrollArea className="flex-1">
          <GroupedActivities
            member_id={memberId}
            className="mx-auto max-w-3xl px-4 md:px-8"
          />
        </ScrollArea>
        <MemberSidebar member={member} tags={tags} />
      </div>
    </div>
  );
}

import { getMember } from "@/actions/members/getMember";
import { listTags } from "@/actions/tags/listTags";
import { PageLayout } from "@/components/layouts/page-layout";
import { Activities } from "@/features/activities/activities";
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
import { redirect } from "next/navigation";

type Props = {
  params: {
    slug: string;
    memberId: string;
  };
};

export default async function Page({ params: { memberId, slug } }: Props) {
  const rMember = await getMember({ id: memberId });
  const rTags = await listTags();

  const member = rMember?.data;
  const tags = rTags?.data;

  if (!member) redirect(`/w/${slug}/members`);

  const { full_name } = member;

  return (
    <PageLayout>
      <div className="flex h-12 shrink-0 items-center justify-between px-4 border-b">
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
      <div className="flex divide-x h-full">
        <ScrollArea className="flex-1">
          <Activities member_id={memberId} className="px-4" />
        </ScrollArea>
        <MemberSidebar member={member} tags={tags} />
      </div>
    </PageLayout>
  );
}

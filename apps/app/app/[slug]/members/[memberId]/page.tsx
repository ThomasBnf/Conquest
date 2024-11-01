import { PageLayout } from "@/components/layouts/page-layout";
import { Activities } from "@/features/activities/components/activities";
import { _getMember } from "@/features/members/actions/_getMember";
import { MemberHeader } from "@/features/members/components/member-header";
import { MemberSidebar } from "@/features/members/components/member-sidebar";
import { listTags } from "@/features/tags/queries/listTags";
import { Avatar, AvatarFallback, AvatarImage } from "@conquest/ui/avatar";
import { ScrollArea } from "@conquest/ui/scroll-area";
import { Separator } from "@conquest/ui/separator";
import { redirect } from "next/navigation";

type Props = {
  params: {
    slug: string;
    memberId: string;
  };
};

export default async function Page({ params: { memberId, slug } }: Props) {
  const rMember = await _getMember({ id: memberId });
  const rTags = await listTags();

  const member = rMember?.data;
  const tags = rTags?.data;

  if (!member) redirect(`/${slug}/members`);

  const { id, avatar_url, first_name, last_name, full_name } = member;

  return (
    <PageLayout>
      <div className="p-4 flex flex-col gap-4">
        <MemberHeader member={member} />
        <div className="flex items-center gap-2">
          <Avatar className="size-12">
            <AvatarImage src={avatar_url ?? ""} />
            <AvatarFallback className="text-sm">
              {first_name?.charAt(0).toUpperCase()}
              {last_name?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-base font-medium leading-tight">{full_name}</p>
            <p className="text-xs text-muted-foreground">{id}</p>
          </div>
        </div>
      </div>
      <Separator />
      <div className="flex divide-x h-full overflow-hidden">
        <MemberSidebar member={member} tags={tags} />
        <ScrollArea className="flex-1">
          <Activities member_id={memberId} className="px-8" />
        </ScrollArea>
      </div>
    </PageLayout>
  );
}

import { GroupedActivities } from "@/features/activities/grouped-activities";
import { ContactSidebar } from "@/features/contacts/contact-sidebar";
import { getFromPage } from "@/helpers/getFromPage";
import { listActivities } from "@/queries/activities/listActivities";
import { getContact } from "@/queries/contacts/getContact";
import { listTags } from "@/queries/tags/listTags";
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
    contactId: string;
  };
  searchParams: {
    from: string;
  };
};

export default async function Page({
  params: { contactId, slug },
  searchParams: { from },
}: Props) {
  const fromPage = getFromPage({ from });

  const rActivities = await listActivities({ contact_id: contactId });
  const activities = rActivities?.data;

  const rContact = await getContact({ id: contactId });
  const contact = rContact?.data;

  const rTags = await listTags();
  const tags = rTags?.data;

  if (!contact) redirect(`/${slug}/${from}`);

  const { full_name } = contact;

  return (
    <div className="flex h-full flex-col divide-y">
      <div className="flex h-12 items-center px-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href={`/${slug}/${from}`}>
                {fromPage}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{full_name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <div className="flex min-h-0 flex-1 divide-x">
        <ScrollArea className="flex-1">
          <GroupedActivities
            activities={activities}
            className="mx-auto max-w-3xl px-4 md:px-8"
          />
        </ScrollArea>
        <ContactSidebar contact={contact} tags={tags} />
      </div>
    </div>
  );
}

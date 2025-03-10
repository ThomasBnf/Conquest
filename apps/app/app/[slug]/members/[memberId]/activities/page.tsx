import { PageActivities } from "@/features/members/page-activities";

type Props = {
  params: Promise<{
    slug: string;
    memberId: string;
  }>;
};

export default async function Page({ params }: Props) {
  const { slug, memberId } = await params;

  return <PageActivities slug={slug} memberId={memberId} />;
}

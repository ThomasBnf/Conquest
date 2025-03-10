import { PageAnalytics } from "@/features/members/page-analytics";

type Props = {
  params: Promise<{
    slug: string;
    memberId: string;
  }>;
};

export default async function Page({ params }: Props) {
  const { slug, memberId } = await params;

  return <PageAnalytics slug={slug} memberId={memberId} />;
}

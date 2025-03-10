import { LayoutMember } from "@/features/members/layout-member";
import type { PropsWithChildren } from "react";

type Props = {
  params: Promise<{
    slug: string;
    memberId: string;
  }>;
};

export default async function Layout({
  children,
  params,
}: PropsWithChildren<Props>) {
  const { slug, memberId } = await params;

  return (
    <LayoutMember slug={slug} memberId={memberId}>
      {children}
    </LayoutMember>
  );
}

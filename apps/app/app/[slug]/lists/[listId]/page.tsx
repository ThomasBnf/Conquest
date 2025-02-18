"use client";

import { Header } from "@/components/layouts/header";
import { PageLayout } from "@/components/layouts/page-layout";
import { IsLoading } from "@/components/states/is-loading";
import { FiltersProvider } from "@/context/filtersContext";
import { MembersProvider } from "@/context/membersContext";
import { MenuList } from "@/features/lists/menu-list";
import { MembersPage } from "@/features/members/members-page";
import { trpc } from "@/server/client";
import { redirect } from "next/navigation";

type Props = {
  params: {
    listId: string;
  };
};

export default function Page({ params: { listId } }: Props) {
  const { data: list, isLoading } = trpc.lists.getList.useQuery({ id: listId });

  if (isLoading) return <IsLoading />;
  if (!list) redirect("/members");

  return (
    <PageLayout>
      <Header title={`${list.emoji} ${list.name}`}>
        <MenuList list={list} />
      </Header>
      <FiltersProvider defaultGroupFilters={list.groupFilters}>
        <MembersProvider>
          <MembersPage />
        </MembersProvider>
      </FiltersProvider>
    </PageLayout>
  );
}

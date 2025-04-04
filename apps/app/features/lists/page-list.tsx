"use client";

import { Header } from "@/components/layouts/header";
import { PageLayout } from "@/components/layouts/page-layout";
import { IsLoading } from "@/components/states/is-loading";
import { FiltersProvider } from "@/context/filtersContext";
import { MenuList } from "@/features/lists/menu-list";
import { MembersPage } from "@/features/members/members-page";
import { trpc } from "@/server/client";
import { redirect } from "next/navigation";

type Props = {
  listId: string;
};

export const PageList = ({ listId }: Props) => {
  const { data: list, isLoading } = trpc.lists.get.useQuery({ id: listId });

  if (isLoading) return <IsLoading />;
  if (!list) redirect("/members");

  return (
    <PageLayout>
      <Header title={`${list.emoji} ${list.name}`}>
        <MenuList list={list} />
      </Header>
      <FiltersProvider initialGroupFilters={list.groupFilters}>
        <MembersPage />
      </FiltersProvider>
    </PageLayout>
  );
};

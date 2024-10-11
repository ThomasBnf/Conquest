

type Props = {
  searchParams: Record<string, string | string[] | undefined>;
};

export default async function Page({ searchParams }: Props) {
  return (
    <div className="flex h-full flex-col divide-y">
      <div className="flex h-12 shrink-0 items-center justify-between px-4">
        <p className="font-medium">Dashboard</p>
        {/* <DateRangePicker /> */}
      </div>
      {/* <ScrollArea>
        <div className="grid grid-cols-4 gap-4 p-4">
          <Contacts />
          <ActiveContacts />
          <Activities />
          <EngagementRate />
        </div>
        <Separator />
        <div className="flex flex-col gap-4 p-4">
          <ChartContacts contacts={contacts} />
          <ChartActiveContacts contacts={contacts} />
          <ChartEngagement dailyEngagement={engagement} />
          <ChartActivityType activities={activities} />
        </div>
      </ScrollArea> */}
    </div>
  );
}

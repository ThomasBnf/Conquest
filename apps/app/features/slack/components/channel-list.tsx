"use client";

import { useUser } from "@/context/userContext";
import { Button } from "@conquest/ui/button";
import { Separator } from "@conquest/ui/separator";
import { Skeleton } from "@conquest/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { RefreshCcw } from "lucide-react";
import { useState } from "react";
import { installSlack } from "../actions/installSlack";
import { listChannels } from "../actions/listChannels";
import { Channel } from "./channel";

export const ChannelsList = () => {
  const { slack } = useUser();
  const [loading, setLoading] = useState(slack?.status === "SYNCING");
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);

  const {
    data: channels,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["slack", "channels"],
    queryFn: async () => {
      const rChannels = await listChannels();
      return rChannels?.data;
    },
    enabled: !!slack?.id,
  });

  const onSelect = (channel: string | undefined) => {
    if (!channel) return;

    if (selectedChannels.includes(channel)) {
      setSelectedChannels((prev) => prev.filter((id) => id !== channel));
    } else {
      setSelectedChannels((prev) => [...prev, channel]);
    }
  };

  const onStart = () => {
    setLoading(true);
    installSlack({ channels: selectedChannels });
  };

  const onRefresh = () => {
    setLoading(true);
    refetch();
  };

  if (!slack?.id) return;

  if (isLoading)
    return (
      <>
        <Separator />
        <div className="p-4">
          <div className="flex items-center justify-between">
            <p className="font-medium text-base">Imported channels</p>
            <Skeleton className="h-8 w-[89px]" />
          </div>
          <div className="mt-2 mb-6 flex flex-col gap-1">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-5 w-44" />
            <Skeleton className="h-5 w-32" />
          </div>
          <Skeleton className="h-8 w-[88px]" />
        </div>
      </>
    );

  return (
    <>
      <Separator />
      <div className="p-4">
        <div className="flex items-center justify-between">
          <p className="font-medium text-base">Imported channels</p>
          <Button variant="outline" size="sm" onClick={onRefresh}>
            <RefreshCcw size={14} />
            Refresh
          </Button>
        </div>
        <div className="mt-2 mb-6 flex flex-col gap-1">
          {channels?.map((channel) => (
            <Channel
              key={channel.id}
              channel={channel}
              selected={selectedChannels}
              onSelect={onSelect}
            />
          ))}
        </div>
        <Button
          loading={loading}
          disabled={selectedChannels.length === 0}
          onClick={onStart}
        >
          Let's start!
        </Button>
      </div>
    </>
  );
};

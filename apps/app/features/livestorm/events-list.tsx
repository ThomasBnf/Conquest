"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@conquest/ui/card";
import type { Event } from "@conquest/zod/schemas/event.schema";
import { EventCard } from "./event-card";

type Props = {
  events: Event[];
};

export const EventsList = ({ events }: Props) => {
  if (events.length === 0) return;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-medium text-base">Events</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2 divide-y">
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </CardContent>
    </Card>
  );
};

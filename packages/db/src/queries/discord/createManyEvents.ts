import type { DiscordIntegration } from "@conquest/zod/schemas/integration.schema";
import { type APIGuildScheduledEvent, Routes } from "discord-api-types/v10";
import { discordClient } from "../../discord";
import { createEvent } from "../events/createEvent";

type Props = {
  discord: DiscordIntegration;
};

export const createManyEvents = async ({ discord }: Props) => {
  const { external_id, details, workspace_id } = discord;
  const { access_token } = details;

  if (!external_id) return;

  const events = (await discordClient.get(
    Routes.guildScheduledEvents(external_id),
    { headers: { Authorization: `Bearer ${access_token}` } },
  )) as APIGuildScheduledEvent[];

  console.log(events);

  for (const event of events) {
    const { id, name, scheduled_start_time, scheduled_end_time } = event;

    await createEvent({
      external_id: id,
      title: name,
      started_at: scheduled_start_time,
      ended_at: scheduled_end_time,
      source: "DISCORD",
      workspace_id,
    });
  }
};

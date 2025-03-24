import { Button } from "@conquest/ui/button";
import { ArrowRight } from "lucide-react";

const items = [
  {
    id: 1,
    title: "All your member details, finally connected.",
    text: "Forget manual tracking. Conquest automatically gathers first name, job title, emails, location, and IDs from Slack, Discord, Discourse, LinkedIn, and more—all in one place.",
  },
  {
    id: 2,
    title: "See everything, everywhere.",
    text: "Track every interaction across Slack, LinkedIn, Discord, Discourse, and Livestorm. Messages, replies, likes, event participation—every touchpoint in one unified timeline.",
  },
  {
    id: 3,
    title: "No more gut feeling.",
    text: "Understand your community with real-time engagement metrics and detailed insights. See who’s active, who’s slipping away, and where to take action.",
  },
  {
    id: 4,
    title: "Identify champions. Activate lurkers.",
    text: "Categorize your members into precise engagement levels so you always know who to focus on—and how.",
  },
];

export const Solution = () => {
  return (
    <section className="flex flex-col items-start gap-4 text-balance bg-sidebar px-4 py-24">
      <h2 className="font-medium text-3xl">
        From scattered data to strategic action.
      </h2>
      <p className="text-base text-muted-foreground">
        Conquest gives you the clarity and control to turn community signals
        into business results.
      </p>
      <div className="mt-6 space-y-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex flex-col rounded-md border bg-background p-4 shadow-sm"
          >
            <p className="font-medium text-base">{item.title}</p>
            <p className="text-base text-muted-foreground">{item.text}</p>
          </div>
        ))}
      </div>
      <Button size="md">
        Sign up for free <ArrowRight size={16} />
      </Button>
    </section>
  );
};

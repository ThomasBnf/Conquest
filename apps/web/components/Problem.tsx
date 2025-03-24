import { Button } from "@conquest/ui/button";
import { ArrowRight, X } from "lucide-react";

const items = [
  {
    id: 1,
    title: "Your community is everywhere, your data is too",
    text: "Members are active on Slack, LinkedIn, Discord, Discourse… but your insights? Lost across multiple tools with no way to connect the dots.",
  },
  {
    id: 2,
    title: "Your community is driving impact. But no one sees it.",
    text: "You’re bringing in leads, reducing churn, driving adoption… but without proof, it’s just another assumption.",
  },
  {
    id: 3,
    title: "Marketing, Sales, Product—they all say the community matters.",
    text: "Without clear data, community impact stays theoretical.",
  },
];

export const Problem = () => {
  return (
    <section className="flex flex-col items-start gap-4 text-balance px-4 py-24">
      <p className="text-orange-500">[Why you need Conquest]</p>
      <h2 className="font-medium text-3xl">
        You can't prove what you can't track
      </h2>
      <p className="text-base text-muted-foreground">
        You know your community is valuable. Now imagine if you could actually
        prove it.
      </p>
      <div className="mt-6 space-y-10">
        {items.map((item) => (
          <div key={item.id} className="flex flex-col">
            <div className="w-fit rounded border border-orange-300 bg-orange-100 p-1">
              <X size={20} className="text-orange-500" />
            </div>
            <p className="mt-4 font-medium text-base">{item.title}</p>
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

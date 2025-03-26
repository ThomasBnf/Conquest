import { Button } from "@conquest/ui/button";
import { ArrowRight, X } from "lucide-react";

const items = [
  {
    id: 1,
    title: "Your community is everywhere, your data is too.",
    text: "Lost across multiple tools with no way to connect the dots.",
  },
  {
    id: 2,
    title: "Every member looks the same without context",
    text: "No way to tell a lurker from an ambassador. No levels, no scores, no priorities.",
  },
  {
    id: 3,
    title: "Your community is driving impact, but no one sees it.",
    text: "You’re bringing in leads, reducing churn, driving adoption. But you need the data to back it up.",
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
        You know your community is valuable but...
      </p>
      <div className="mt-6 space-y-10">
        {items.map((item) => (
          <div key={item.id} className="flex flex-col">
            <div className="w-fit rounded border border-red-300 bg-red-100 p-1">
              <X size={20} className="text-red-500" />
            </div>
            <p className="mt-4 font-medium text-base">{item.title}</p>
            <p className="text-base text-muted-foreground">{item.text}</p>
          </div>
        ))}
      </div>
      <Button size="md" className="mt-10">
        Sign up for free <ArrowRight size={16} />
      </Button>
    </section>
  );
};

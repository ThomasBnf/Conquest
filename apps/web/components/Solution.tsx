import { Discord } from "@conquest/ui/icons/Discord";
import { Discourse } from "@conquest/ui/icons/Discourse";
import { Github } from "@conquest/ui/icons/Github";
import { Linkedin } from "@conquest/ui/icons/Linkedin";
import { Livestorm } from "@conquest/ui/icons/Livestorm";
import { Slack } from "@conquest/ui/icons/Slack";

const icons = [
  {
    icon: Discord,
    name: "Discord",
  },
  {
    icon: Discourse,
    name: "Discourse",
  },
  {
    icon: Github,
    name: "Github",
  },
  {
    icon: Linkedin,
    name: "Linkedin",
  },
  {
    icon: Livestorm,
    name: "Livestorm",
  },
  {
    icon: Slack,
    name: "Slack",
  },
];

export const Solution = () => {
  return (
    <section className="flex flex-col gap-10 px-4 py-16">
      <div>
        <h2 className="mt-4 text-balance font-bold font-telegraf text-3xl">
          Finally, a CRM built for community.
        </h2>
      </div>
      <div className="flex flex-col gap-10">
        <Aggregator />
        <Focus />
        <Actions />
      </div>
    </section>
  );
};

export const Aggregator = () => (
  <div className="space-y-4">
    <div className="space-y-2">
      <div className="flex space-x-2">
        {icons.slice(0, 3).map((icon) => (
          <div
            key={icon.name}
            className="flex-1 rounded-md border bg-sidebar p-3 shadow-sm"
          >
            <icon.icon size={24} />
            <p className="mt-2 font-medium">{icon.name}</p>
          </div>
        ))}
      </div>
      <div className="flex space-x-2">
        {icons.slice(3, 6).map((icon) => (
          <div
            key={icon.name}
            className="flex-1 rounded-md border bg-sidebar p-3 shadow-sm"
          >
            <icon.icon size={24} />
            <p className="mt-2 font-medium">{icon.name}</p>
          </div>
        ))}
      </div>
    </div>
    <h3 className="font-bold font-telegraf text-xl">
      A single source of truth
    </h3>
  </div>
);

export const Focus = () => (
  <div className="space-y-4">
    <img
      src="./members-scoring.png"
      alt="Members scoring"
      className="w-full rounded-md border"
    />
    <h3 className="font-bold font-telegraf text-xl">
      Understand what active means
    </h3>
  </div>
);

export const Actions = () => (
  <div className="space-y-4">
    <img
      src="./actions-on-members.png"
      alt="Pulse score"
      className="w-full rounded-md"
    />
    <h3 className="font-bold font-telegraf text-xl">Know who to focus on</h3>
  </div>
);

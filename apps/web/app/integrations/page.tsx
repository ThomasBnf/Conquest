import { MainLayout } from "@/components/MainLayout";
import { buttonVariants } from "@conquest/ui/button";
import { Discord } from "@conquest/ui/icons/Discord";
import { Discourse } from "@conquest/ui/icons/Discourse";
import { Github } from "@conquest/ui/icons/Github";
import { Livestorm } from "@conquest/ui/icons/Livestorm";
import { Slack } from "@conquest/ui/icons/Slack";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

const integrations = [
  {
    logo: <Discord />,
    name: "Discord",
    description:
      "Connect your Discord community to get a complete overview of your members and community activity.",
    documentation: "https://docs.useconquest.com/integrations/discord",
  },
  {
    logo: <Discourse />,
    name: "Discourse",
    description:
      "Connect your Discourse community to get a complete overview of your members and community activity.",
    documentation: "https://docs.useconquest.com/integrations/discourse",
  },
  {
    logo: <Github />,
    name: "Github",
    description:
      "Connect your GitHub repository to track stargazers, issues, and pull requests.",
    documentation: "https://docs.useconquest.com/integrations/github",
  },
  {
    logo: <Livestorm />,
    name: "Livestorm",
    description:
      "Connect your Livestorm workspace to access all your webinar sessions and participant data.",
    documentation: "https://docs.useconquest.com/integrations/livestorm",
  },
  {
    logo: <Slack />,
    name: "Slack",
    description:
      "Connect your Slack community to get a complete overview of your members and community activity.",
    documentation: "https://docs.useconquest.com/integrations/slack",
  },
];

export default function Page() {
  return (
    <MainLayout>
      <section>
        <div className="flex flex-col items-center gap-4 pt-32 pb-24 text-center bg-sidebar">
          <h1 className="max-w-3xl text-4xl font-bold font-telegraf lg:text-6xl">
            Integrations
          </h1>
          <p className="max-w-xl text-lg text-balance font-suisse text-muted-foreground">
            No dev required – Connect your community and tools to Conquest in
            just 5 clicks
          </p>
          <div className="flex items-center gap-2 mt-4">
            <Link
              href="https://app.useconquest.com/auth/signup"
              className={buttonVariants({ variant: "brand", size: "md" })}
            >
              Try for free
              <ArrowRight size={16} />
            </Link>
            <Link
              href="https://cal.com/audrey-godard-conquest/30min"
              className={buttonVariants({ variant: "outline", size: "md" })}
            >
              Book a demo
            </Link>
          </div>
        </div>
      </section>
      <section className="grid w-full max-w-5xl gap-4 px-4 pt-24 mx-auto md:grid-cols-2">
        {integrations.map((integration) => (
          <Link
            key={integration.name}
            href={integration.documentation}
            target="_blank"
            className="rounded-md border p-4 shadow-sm transition-all hover:scale-[1.02]"
          >
            {integration.logo}
            <h3 className="mt-4 text-2xl font-bold font-telegraf">
              {integration.name}
            </h3>
            <p className="text-base text-muted-foreground">
              {integration.description}
            </p>
          </Link>
        ))}
      </section>
    </MainLayout>
  );
}

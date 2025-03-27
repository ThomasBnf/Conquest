import { Separator } from "@conquest/ui/separator";
import Image from "next/image";

export const Features = () => {
  return (
    <section className="flex flex-col gap-10 bg-sidebar px-4 py-16">
      <div className="flex flex-col gap-1">
        <p className="text-base text-brand-400">[Features]</p>
        <h2 className="mt-4 font-medium text-3xl">
          Everything you need to understand, structure, and scale your
          community.
        </h2>
      </div>
      <div className="space-y-8">
        <div className="flex flex-col gap-1">
          <h3 className="text-balance font-medium text-2xl">
            Design a scoring system that fits your community
          </h3>
          <p className="text-base text-muted-foreground">
            Activities are not equal. Assign points, add conditions based on
            activity impact.
          </p>
          <Image
            src="./activity-type.png"
            alt="Editing activity type"
            className="mt-4 rounded-md border bg-background p-2"
          />
        </div>
        <Separator />
        <div className="flex flex-col gap-1">
          <h3 className="font-medium text-2xl">
            Add context with custom tags.
          </h3>
          <p className="text-base text-muted-foreground">
            Categorize your members beyond activity by intent, persona, stage.
          </p>
          <Image
            src="./tags.png"
            alt="Tags picker"
            className="mt-4 rounded-md border bg-background"
          />
        </div>
        <Separator />
        <div className="flex flex-col gap-1">
          <h3 className="font-medium text-2xl">
            Spot your most valuable members
          </h3>
          <p className="text-base text-muted-foreground">
            Scores every member based on recent activities, so you can re-engage
            lurkers, and spot rising ambassadors.
          </p>
          <Image
            src="./members-scoring.png"
            alt="Members table with scoring"
            className="mt-4 rounded-md border bg-background"
          />
        </div>
        <Separator />
        <div className="flex flex-col gap-1">
          <h3 className="text-balance font-medium text-2xl">
            Segment your community for targeted actions
          </h3>
          <p className="text-base text-muted-foreground">
            Build lists that drive programs, rewards and outreach.
          </p>
          <Image
            src="./filters.png"
            alt="Filters"
            className="mt-4 rounded-md border bg-background"
          />
        </div>
      </div>
    </section>
  );
};

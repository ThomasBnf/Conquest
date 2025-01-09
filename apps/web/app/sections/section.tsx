import { Button } from "@conquest/ui/button";

export const Section = () => {
  return (
    <section className="text-balance px-4 pb-12">
      <h2 className="font-bold text-3xl">Demonstrate your community ROI</h2>
      <p className="mt-4 text-base text-muted-foreground">
        by finally having key insights and member touch points everywhere, even
        in your product.
      </p>
      <div className="mt-8">
        <h3 className="font-bold text-2xl">Data aggregator</h3>
        <p className="mt-2 text-base text-muted-foreground">
          Collect members data in one place and become a data-driven community
          expert.
        </p>

        <Button variant="outline" className="mt-4 text-base">
          Learn more
        </Button>
      </div>
      <div className="mt-8">
        <h3 className="font-bold text-2xl">Activity tracking</h3>
        <p className="mt-2 text-base text-muted-foreground">
          Automatically track member interactions with your product and content
          across all channels to get the full picture.
        </p>
        <Button variant="outline" className="mt-4 text-base">
          Learn more
        </Button>
      </div>
      <div className="mt-8">
        <h3 className="font-bold text-2xl">Engagement analytics</h3>
        <p className="mt-2 text-base text-muted-foreground">
          Gain access to comprehensive community metrics and detailed insights
          into member engagement journey.
        </p>
        <Button variant="outline" className="mt-4 text-base">
          Learn more
        </Button>
      </div>
      <div className="mt-8">
        <h3 className="font-bold text-2xl">Member scoring</h3>
        <p className="mt-2 text-base text-muted-foreground">
          Categorize your members into precise engagement level and know exactly
          where to prioritize your efforts.
        </p>
        <Button variant="outline" className="mt-4 text-base">
          Learn more
        </Button>
      </div>
    </section>
  );
};

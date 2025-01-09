import { Button } from "@conquest/ui/button";

export const Hero = () => {
  return (
    <div className="py-28">
      <div className="flex flex-col gap-4 text-balance text-center">
        <h1 className="font-bold text-4xl">
          Your only platform for community growth
        </h1>
        <p className="text-base opacity-70">
          Conquest is the CRM you need to track, understand, engage and scale
          your community.
        </p>
        <div>
          <div className="mt-2 flex justify-center gap-2">
            <Button size="md">Get started</Button>
            <Button variant="outline" size="md">
              Get a demo
            </Button>
          </div>
          <p className="mt-2 text-sm opacity-70">
            14 days free trial. No credit card required.
          </p>
        </div>
      </div>
    </div>
  );
};

export const Integrations = () => {
  return (
    <section className="flex flex-col justify-center gap-4 text-balance px-4 py-16">
      <h2 className="font-medium text-3xl">
        Integrates everywhere your company lives
      </h2>
      <p className="text-base text-muted-foreground">
        Get a 360-degree view of member engagement - not just within your
        community, but across all your tools.
      </p>
      {/* <div className="relative flex h-[500px] w-full flex-col items-center justify-center overflow-hidden">
        <Logo size={48} />
        <OrbitingCircles>
          <Slack size={48} />
          <Discord size={48} />
          <Discourse size={48} />
          <Twitter size={48} />
        </OrbitingCircles>
        <OrbitingCircles radius={100} reverse speed={1.5}>
          <Linkedin size={48} />
          <Livestorm size={48} />
          <Github size={48} />
        </OrbitingCircles>
      </div> */}
    </section>
  );
};

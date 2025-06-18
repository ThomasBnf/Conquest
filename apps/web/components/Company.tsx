const items = [
  {
    id: 1,
    title: "Sales",
    subtitle: "Turn engaged members into qualified leads.",
    arguments: [
      "Identify high-intent leads from your community.",
      "Spot upsell opportunities based on interactions.",
      "Reduce churn by tracking engagement signals.",
    ],
  },
];

export const Company = () => {
  return (
    <section className="flex flex-col items-start gap-4 text-balance bg-[#1E1F20] px-4 py-24">
      <h2 className="font-medium text-3xl text-white">
        Make your community a top priority across your company.
      </h2>
      <p className="text-base text-primary-foreground/70">
        Collaborate more closely with your teams, where the magic of growth
        happens.
      </p>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {items.map((item) => (
          <div key={item.id}>
            <h3 className="font-medium text-white text-xl">{item.title}</h3>
            <p className="text-primary-foreground/70">{item.subtitle}</p>
            <ul className="list-inside list-disc text-primary-foreground/70">
              {item.arguments.map((argument) => (
                <li key={argument}>{argument}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
};

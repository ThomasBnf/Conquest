import { icons } from "lucide-react";
import { Icon } from "./Icon";
import { Container, Heading, Section } from "./Section";

export const Problem = () => {
  const problems: {
    icon: keyof typeof icons;
    name: string;
  }[] = [
    {
      icon: "CircleAlert",
      name: "Poor community data",
    },
    {
      icon: "ChartBar",
      name: "Can't measure community performance",
    },
    {
      icon: "EyeOff",
      name: "Unknown ROI",
    },
  ];

  const insights: {
    icon: keyof typeof icons;
    name: string;
  }[] = [
    {
      icon: "Activity",
      name: "Most active members",
    },
    {
      icon: "ThumbsUp",
      name: "Potential advocates",
    },
    {
      icon: "TrendingUp",
      name: "Upsell opportunities",
    },
    {
      icon: "TriangleAlert",
      name: "Churn risks",
    },
    {
      icon: "Eye",
      name: "Lurkers identification",
    },
    {
      icon: "Bell",
      name: "Inactive members alert",
    },
    {
      icon: "RotateCcw",
      name: "Returning members",
    },
    {
      icon: "Monitor",
      name: "Preferred platforms",
    },
    {
      icon: "Star",
      name: "Members Interests",
    },
    {
      icon: "TrendingUp",
      name: "Trending topics",
    },
  ];

  return (
    <Section id="problem">
      <Heading className="mx-auto text-center">
        Growing a community is hard
      </Heading>
      <Container className="flex-col items-center justify-center gap-4">
        <div className="flex flex-wrap justify-center gap-2">
          {problems.map((problem) => (
            <div
              key={problem.name}
              className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50/50 p-2 text-red-600"
            >
              <Icon name={problem.icon} size={16} />
              <p className="leading-none">{problem.name}</p>
            </div>
          ))}
        </div>
        <Heading className="my-4">Unless you have the right insights</Heading>
        <div className="flex max-w-3xl flex-wrap items-center justify-center gap-2">
          {insights.map((insight) => (
            <div
              key={insight.name}
              className="flex items-center gap-2 rounded-lg border border-main-200 bg-main-100/10 p-2 text-main-500"
            >
              <Icon name={insight.icon} size={16} />
              <p className="leading-none">{insight.name}</p>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
};

type Props = {
  id: string;
  desc: boolean;
  type: "members" | "companies";
};

export const orderByParser = ({ id, desc, type }: Props) => {
  const direction = desc ? "desc" : "asc";

  if (type === "members") {
    switch (id) {
      case "name":
        return [
          { firstName: { sort: direction, nulls: "last" } },
          { lastName: { sort: direction, nulls: "last" } },
          { id: direction },
        ];
      case "company":
        return [
          { company: { name: direction, nulls: "last" } },
          { id: direction },
        ];
      case "tags":
        return [
          { tags: { sort: direction, nulls: "last" } },
          { id: direction },
        ];
      case "level":
        return [
          { levelNumber: { sort: direction, nulls: "last" } },
          { pulse: direction },
          { id: direction },
        ];
      case "pulse":
        return [
          { levelNumber: { sort: direction, nulls: "last" } },
          { pulse: direction },
          { id: direction },
        ];
      case "jobTitle":
        return [
          { jobTitle: { sort: direction, nulls: "last" } },
          { id: direction },
        ];
      case "emails":
        return [
          { primaryEmail: { sort: direction, nulls: "last" } },
          { id: direction },
        ];
      case "firstActivity":
        return [
          { firstActivity: { sort: direction, nulls: "last" } },
          { id: direction },
        ];
      case "lastActivity":
        return [
          { lastActivity: { sort: direction, nulls: "last" } },
          { id: direction },
        ];
      case "source":
        return [
          { source: { sort: direction, nulls: "last" } },
          { id: direction },
        ];
      case "createdAt":
        return [
          { createdAt: { sort: direction, nulls: "last" } },
          { id: direction },
        ];
    }
  }

  switch (id) {
    case "name":
      return [{ name: direction }, { id: direction }];
    case "tags":
      return [{ tags: direction }, { id: direction }];
    case "domain":
      return [
        { domain: { sort: direction, nulls: "last" } },
        { id: direction },
      ];
    case "industry":
      return [
        { industry: { sort: direction, nulls: "last" } },
        { id: direction },
      ];
    case "employees":
      return [
        { employees: { sort: direction, nulls: "last" } },
        { id: direction },
      ];
    case "foundedAt":
      return [
        { foundedAt: { sort: direction, nulls: "last" } },
        { id: direction },
      ];
    case "source":
      return [{ source: direction }, { id: direction }];
    case "createdAt":
      return [{ createdAt: direction }, { id: direction }];
  }
};

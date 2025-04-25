type Props = {
  id: string;
  desc: boolean;
  type: "members" | "companies";
};

export const orderByParser = ({ id, desc, type }: Props) => {
  const direction = desc ? "DESC" : "ASC";

  if (type === "members") {
    switch (id) {
      case "name":
        return `ORDER BY m.firstName ${direction}, m.lastName ${direction}, m.id ${direction}`;
      case "company":
        return `ORDER BY c.name ${direction}, m.id ${direction}`;
      case "tags":
        return `ORDER BY m.tags ${direction}, m.id ${direction}`;
      case "level":
        return `ORDER BY l.number ${direction}, m.pulse ${direction}, m.id ${direction}`;
      case "pulse":
        return `ORDER BY l.number ${direction}, m.pulse ${direction}, m.id ${direction}`;
      case "jobTitle":
        return `ORDER BY m.jobTitle ${direction}, m.id ${direction}`;
      case "emails":
        return `ORDER BY m.primaryEmail ${direction}, m.id ${direction}`;
      case "firstActivity":
        return `ORDER BY m.firstActivity ${direction}, m.id ${direction}`;
      case "lastActivity":
        return `ORDER BY m.lastActivity ${direction}, m.id ${direction}`;
      case "source":
        return `ORDER BY m.source ${direction}, m.id ${direction}`;
      case "createdAt":
        return `ORDER BY m.createdAt ${direction}, m.id ${direction}`;
    }
  }

  switch (id) {
    case "name":
      return `ORDER BY c.name ${direction}, c.id ${direction}`;
    case "tags":
      return `ORDER BY c.tags ${direction}, c.id ${direction}`;
    case "website":
      return `ORDER BY c.website ${direction}, c.id ${direction}`;
    case "industry":
      return `ORDER BY c.industry ${direction}, c.id ${direction}`;
    case "employees":
      return `ORDER BY c.employees ${direction}, c.id ${direction}`;
    case "foundedAt":
      return `ORDER BY c.foundedAt ${direction}, c.id ${direction}`;
    case "createdAt":
      return `ORDER BY c.createdAt ${direction}, c.id ${direction}`;
    case "source":
      return `ORDER BY c.source ${direction}, c.id ${direction}`;
  }

  return "";
};

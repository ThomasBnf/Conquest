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
        return `ORDER BY m.first_name ${direction}, m.last_name ${direction}, m.id ${direction}`;
      case "company":
        return `ORDER BY c.name ${direction}, m.id ${direction}`;
      case "tags":
        return `ORDER BY m.tags ${direction}, m.id ${direction}`;
      case "level":
        return `ORDER BY l.number ${direction}, m.pulse ${direction}, m.id ${direction}`;
      case "pulse":
        return `ORDER BY l.number ${direction}, m.pulse ${direction}, m.id ${direction}`;
      case "job_title":
        return `ORDER BY m.job_title ${direction}, m.id ${direction}`;
      case "emails":
        return `ORDER BY m.primary_email ${direction}, m.id ${direction}`;
      case "first_activity":
        return `ORDER BY m.first_activity ${direction}, m.id ${direction}`;
      case "last_activity":
        return `ORDER BY m.last_activity ${direction}, m.id ${direction}`;
      case "source":
        return `ORDER BY m.source ${direction}, m.id ${direction}`;
      case "created_at":
        return `ORDER BY m.created_at ${direction}, m.id ${direction}`;
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
    case "founded_at":
      return `ORDER BY c.founded_at ${direction}, c.id ${direction}`;
    case "created_at":
      return `ORDER BY c.created_at ${direction}, c.id ${direction}`;
    case "source":
      return `ORDER BY c.source ${direction}, c.id ${direction}`;
  }

  return "";
};

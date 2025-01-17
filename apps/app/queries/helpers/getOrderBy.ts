type Props = {
  id?: string;
  desc: boolean;
  type: "members" | "companies";
};

export const getOrderBy = ({ id, desc, type }: Props) => {
  const direction = desc ? "DESC" : "ASC";

  if (type === "members") {
    switch (id) {
      case "pulse":
        return `ORDER BY m.pulse ${direction}`;
      case "level":
        return `ORDER BY m.level ${direction}, m.pulse ${direction}`;
      case "full_name":
        return `ORDER BY m.first_name ${direction}, m.last_name ${direction}`;
      case "job_title":
        return `ORDER BY m.job_title ${direction} NULLS LAST`;
      case "emails":
        return `ORDER BY m.primary_email ${direction}`;
      case "tags":
        return `ORDER BY m.tags ${direction} NULLS LAST`;
      case "created_at":
        return `ORDER BY m.created_at ${direction}`;
      case "locale":
        return `ORDER BY m.locale ${direction}`;
      case "source":
        return `ORDER BY m.source ${direction}`;
      case "first_activity":
        return `ORDER BY m.first_activity ${direction}`;
      case "last_activity":
        return `ORDER BY m.last_activity ${direction}`;
      case "company":
        return `ORDER BY c.name ${direction}`;
    }
  }

  switch (id) {
    case "name":
      return `ORDER BY c.name ${direction}`;
    case "tags":
      return `ORDER BY c.tags ${direction} NULLS LAST`;
    case "website":
      return `ORDER BY c.website ${direction}`;
    case "industry":
      return `ORDER BY c.industry ${direction}`;
    case "employees":
      return `ORDER BY c.employees ${direction}`;
    case "founded_at":
      return `ORDER BY c.founded_at ${direction}`;
    case "created_at":
      return `ORDER BY c.created_at ${direction}`;
    case "source":
      return `ORDER BY c.source ${direction}`;
  }

  return "";
};

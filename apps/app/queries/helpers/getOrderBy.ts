export const getOrderBy = (id: string, desc: boolean) => {
  const direction = desc ? "DESC" : "ASC";

  switch (id) {
    case "pulse":
      return `ORDER BY m.pulse ${direction}`;
    case "level":
      return `ORDER BY m.level ${direction}, m.pulse ${direction}`;
    case "full_name":
      return `ORDER BY m.first_name || ' ' || m.last_name ${direction}`;
    case "job_title":
      return `ORDER BY m.job_title ${direction}`;
    case "emails":
      return `ORDER BY m.primary_email ${direction}`;
    case "tags":
      return `ORDER BY m.tags[0] ${direction}`;
    case "joined_at":
      return `ORDER BY m.joined_at ${direction}`;
    case "locale":
      return `ORDER BY m.locale ${direction}`;
    case "source":
      return `ORDER BY m.source ${direction}`;
    case "first_activity":
      return `ORDER BY m.first_activity ${direction}`;
    case "last_activity":
      return `ORDER BY m.last_activity ${direction}`;
    default:
      return `ORDER BY m.id ${direction}`;
  }
};

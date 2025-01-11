type Props = {
  id?: string;
  desc: boolean;
};

export const getOrderBy = ({ id, desc }: Props) => {
  const direction = desc ? "DESC" : "ASC";

  switch (id) {
    case "pulse":
      return `ORDER BY m.pulse ${direction}`;
    case "level":
      return `ORDER BY m.level ${direction}, m.pulse ${direction}`;
    case "full_name":
      return `ORDER BY m.first_name ${direction}, m.last_name ${direction}`;
    case "job_title":
      return `ORDER BY m.job_title ${direction}`;
    case "emails":
      return `ORDER BY m.primary_email ${direction}`;
    case "tags":
      return `ORDER BY m.tags[0] ${direction}`;
    case "created_at":
      return `ORDER BY m.created_at ${direction}`;
    case "location":
      return `ORDER BY m.location ${direction}`;
    case "source":
      return `ORDER BY m.source ${direction}`;
    case "first_activity":
      return `ORDER BY m.first_activity ${direction}`;
    case "last_activity":
      return `ORDER BY m.last_activity ${direction}`;
    case "name":
      return `ORDER BY c.name ${direction}`;
  }

  return "";
};

export const getLevelLabel = (level: number) => {
  switch (level) {
    case 1:
      return "Explorer III";
    case 2:
      return "Explorer II";
    case 3:
      return "Explorer I";
    case 4:
      return "Active III";
    case 5:
      return "Active II";
    case 6:
      return "Active I";
    case 7:
      return "Contributor III";
    case 8:
      return "Contributor II";
    case 9:
      return "Contributor I";
    case 10:
      return "Ambassador III";
    case 11:
      return "Ambassador II";
    case 12:
      return "Ambassador I";
    default:
      return "No activity";
  }
};

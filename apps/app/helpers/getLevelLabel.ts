export const getLevelLabel = (level: number) => {
  switch (level) {
    case 1:
      return "Explorer III • 1";
    case 2:
      return "Explorer II • 2";
    case 3:
      return "Explorer I • 3";
    case 4:
      return "Active III • 4";
    case 5:
      return "Active II • 5";
    case 6:
      return "Active I • 6";
    case 7:
      return "Contributor III • 7";
    case 8:
      return "Contributor II • 8";
    case 9:
      return "Contributor I • 9";
    case 10:
      return "Ambassador III • 10";
    case 11:
      return "Ambassador II • 11";
    case 12:
      return "Ambassador I • 12";
    default:
      return "No activity";
  }
};

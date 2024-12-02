export const getLevelLabel = (level: number) => {
  switch (level) {
    case 1:
      return "Observer III";
    case 2:
      return "Observer II";
    case 3:
      return "Observer I";
    case 4:
      return "User III";
    case 5:
      return "User II";
    case 6:
      return "User I";
    case 7:
      return "Fan III";
    case 8:
      return "Fan II";
    case 9:
      return "Fan I";
    case 10:
      return "Ambassador III";
    case 11:
      return "Ambassador II";
    case 12:
      return "Ambassador I";
    default:
      return "Observer III";
  }
};

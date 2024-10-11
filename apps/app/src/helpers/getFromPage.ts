type Props = {
  from: string;
};

export const getFromPage = ({ from }: Props) => {
  switch (from) {
    case "/":
      return "Dashboard";
    case "contacts":
      return "Contacts";
    case "activities":
      return "Activities";
    case "leaderboard":
      return "Leaderboard";
  }
};

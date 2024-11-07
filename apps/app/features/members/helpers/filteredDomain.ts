export const filteredDomain = (
  domain: string,
): { companyName: string; domain: string } | undefined => {
  if (domain.includes("gmail")) return;
  if (domain.includes("orange")) return;
  if (domain.includes("yahoo")) return;
  if (domain.includes("hotmail")) return;
  if (domain.includes("outlook")) return;
  if (domain.includes("live")) return;
  if (domain.includes("msn")) return;
  if (domain.includes("aol")) return;
  if (domain.includes("protonmail")) return;
  if (domain.includes("icloud")) return;
  if (domain.includes("yandex")) return;
  if (domain.includes("zoho")) return;
  if (domain.includes("fastmail")) return;
  if (domain.includes("gmx")) return;

  const companyName = domain.split(".")[0] ?? "";

  return { companyName, domain };
};

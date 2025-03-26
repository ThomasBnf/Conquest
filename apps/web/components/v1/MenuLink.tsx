"use client";

export const MenuLink = ({
  href,
  label,
  block,
}: {
  href: string;
  label: string;
  block?: ScrollLogicalPosition;
}) => {
  const scrollToSection = () => {
    const section = document.querySelector(href);
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block });
    }
  };

  return (
    <p
      onClick={scrollToSection}
      className="cursor-pointer text-base hover:underline"
    >
      {label}
    </p>
  );
};

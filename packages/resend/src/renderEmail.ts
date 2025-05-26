import { render } from "@react-email/render";

export const renderEmail = async (Component: React.ReactNode) => {
  return await render(Component, { pretty: true });
};

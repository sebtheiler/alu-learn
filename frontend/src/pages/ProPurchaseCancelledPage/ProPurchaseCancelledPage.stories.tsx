import withFullContext from "helpers/withFullContext";
import withNavbar from "helpers/withNavbar";
import { ComponentStory } from "@storybook/react";

import ProPurchaseCancelledPage from ".";

export default {
  title: "Pages/ProPurchaseCancelledPage",
  component: ProPurchaseCancelledPage,
  layout: "fullscreen",
  decorators: [withNavbar, withFullContext],
};

const Template: ComponentStory<typeof ProPurchaseCancelledPage> = () => (
  <ProPurchaseCancelledPage />
);
export const ProPurchaseCancelledPageExample = Template.bind({});

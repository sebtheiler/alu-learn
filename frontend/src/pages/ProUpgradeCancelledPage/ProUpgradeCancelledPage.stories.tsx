import ProUpgradeCancelledPage from ".";
import { ComponentStory } from "@storybook/react";
import withNavbar from "helpers/withNavbar";
import withFullContext from "helpers/withFullContext";

export default {
  title: "Pages/ProUpgradeCancelledPage",
  component: ProUpgradeCancelledPage,
  decorators: [withNavbar, withFullContext],
};

const Template: ComponentStory<typeof ProUpgradeCancelledPage> = (args) => <ProUpgradeCancelledPage />;

export const ProUpgradeCancelledPageExample = Template.bind({});
ProUpgradeCancelledPageExample.parameters = {
  layout: "fullscreen",
}
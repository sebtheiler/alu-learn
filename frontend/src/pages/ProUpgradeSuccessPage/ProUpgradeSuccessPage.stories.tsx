import ProUpgradeSuccessPage from ".";
import { ComponentStory } from "@storybook/react";
import withNavbar from "helpers/withNavbar";
import withFullContext from "helpers/withFullContext";

export default {
  title: "Pages/ProUpgradeSuccessPage",
  component: ProUpgradeSuccessPage,
  decorators: [withNavbar, withFullContext],
};

const Template: ComponentStory<typeof ProUpgradeSuccessPage> = (args) => <ProUpgradeSuccessPage />;

export const ProUpgradeSuccessPageExample = Template.bind({});
ProUpgradeSuccessPageExample.parameters = {
  layout: "fullscreen",
}
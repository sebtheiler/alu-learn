import SearchUser from ".";
import { ComponentStory } from "@storybook/react";

export default {
  title: "Components/SearchUser",
  component: SearchUser,
};

const Template: ComponentStory<typeof SearchUser> = (args) => (
  <SearchUser {...args} />
);

export const SearchUserExample = Template.bind({});
SearchUserExample.args = {};

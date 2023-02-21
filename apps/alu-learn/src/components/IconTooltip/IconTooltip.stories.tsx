import IconTooltip from ".";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { ComponentStory } from "@storybook/react";

export default {
  title: "Components/IconTooltip",
  component: IconTooltip,
};

const Template: ComponentStory<typeof IconTooltip> = (args) => (
  <div className="container mx-auto mt-20">
    <IconTooltip {...args} />
  </div>
);

export const TrashIcon = Template.bind({});
TrashIcon.args = {
  tooltip: "Delete",
  onClick: async (e) => {
    console.log("Deleting...", e);
    await new Promise((r) => setTimeout(r, 2000));
  },
  faIcon: faTrash,
  className: "color-blue-500",
};

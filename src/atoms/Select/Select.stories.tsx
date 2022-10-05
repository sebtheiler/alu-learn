import Select from ".";
import { ComponentStory } from "@storybook/react";

export default {
  title: "Atoms/Select",
  component: Select,
};

const options = [
  {
    value: "STUDENT",
    label: "Student",
  },
  {
    value: "TEACHER",
    label: "Teacher",
  },
  {
    value: "MIXED",
    label: "Mixed",
  },
];

const Template: ComponentStory<typeof Select> = (args) => <Select {...args} />;

export const BasicSelect = Template.bind({});
BasicSelect.args = {
  options: options,
  className: "max-w-lg",
};

export const WithLabel = Template.bind({});
WithLabel.args = {
  label: "User Type",
  options: options,
  className: "max-w-lg",
};

export const WithDisabled = Template.bind({});
WithDisabled.args = {
  options: [
    ...options,
    { value: "DISABLED", label: "Disabled Option", disabled: true },
  ],
  className: "max-w-lg",
};

export const WithDefaultValue = Template.bind({});
WithDefaultValue.args = {
  options: options,
  className: "max-w-lg",
  defaultValue: "TEACHER",
};

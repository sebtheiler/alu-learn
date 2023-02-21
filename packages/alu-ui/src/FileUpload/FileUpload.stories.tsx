import FileUpload from ".";
import { ComponentStory } from "@storybook/react";

export default {
  title: "FileUpload",
  component: FileUpload,
};

const Template: ComponentStory<typeof FileUpload> = (args) => (
  <FileUpload {...args} />
);

export const FileUploadExample = Template.bind({});
FileUploadExample.args = {
  label: "Upload file",
};

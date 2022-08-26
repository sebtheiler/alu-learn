import CreateFlashcardsPage from ".";
import withFullContext from "@/helpers/withFullContext";
import withNavbar from "@/helpers/withNavbar";
import { ComponentStory } from "@storybook/react";

const course = {
  id: "cl76ef2sw0097l3i071xv4x9n",
  title: "U.S. History",
  courseSections: [
    {
      id: "cl7anemon006918i0zasoj1xa",
      title: "Unit 1",
      slug: "unit-1",
      subSections: [
        {
          id: "cl7anemos007518i0llge5qs6",
          title: "Unit 1.1",
          slug: "unit-1.1",
        },
      ],
    },
    {
      id: "cl7anemon006918i0zasoj1xa",
      title: "Unit 2",
      slug: "unit-2",
      subSections: [
        {
          id: "cl7anemos007518i0llge5qs6",
          title: "Unit 2.1",
          slug: "unit-2.1",
        },
        {
          id: "cl7anemos007518i0llge5qs6",
          title: "Unit 2.2",
          slug: "unit-2.2",
        },
      ],
    },
  ],
};

export default {
  title: "pages/CreateFlashcardsPage",
  component: CreateFlashcardsPage,
  decorators: [withNavbar, withFullContext],
};

const Template: ComponentStory<typeof CreateFlashcardsPage> = (args) => (
  <CreateFlashcardsPage {...args} />
);

export const CreateFlashcardsPageExample = Template.bind({});
CreateFlashcardsPageExample.args = {
  course,
  courseSectionSlug: "unit-2",
  subSectionSlug: "unit-2.1",
};
CreateFlashcardsPageExample.parameters = {
  layout: "fullscreen",
};

import { ComponentStory } from "@storybook/react";
import {
  faGraduationCap,
  faNewspaper,
  faPersonChalkboard,
  faUserGroup,
} from "@fortawesome/free-solid-svg-icons";

import ChoiceSelect from ".";

export default {
  title: "Pages/WelcomeSurveyPage/ChoiceSelect",
  component: ChoiceSelect,
};

const Template: ComponentStory<typeof ChoiceSelect> = (args) => (
  <div className="container px-48">
    <ChoiceSelect {...args} />
  </div>
);

export const TwoChoices = Template.bind({});
TwoChoices.args = {
  choices: [
    {
      value: "STUDENT",
      display: "Student",
      icon: faGraduationCap,
      iconColor: "dodgerblue",
    },
    {
      value: "TEACHER",
      display: "Teacher",
      icon: faPersonChalkboard,
      iconColor: "indigo",
    },
  ],
  onClick: console.log,
};

export const ManyChoices = Template.bind({});
ManyChoices.args = {
  choices: [
    {
      value: "FRIENDS",
      display: "Friends/Family",
      icon: faUserGroup,
      iconColor: "orange",
    },
    {
      value: "TEACHER",
      display: "Teacher",
      icon: faPersonChalkboard,
      iconColor: "indigo",
    },
    {
      value: "INSTA",
      display: "Instagram",
      icon: "/assets/logos/instagram.svg",
    },
    { value: "REDDIT", display: "Reddit", icon: "/assets/logos/reddit.svg" },
    { value: "TIKTOK", display: "TikTok", icon: "/assets/logos/tiktok.svg" },
    { value: "YOUTUBE", display: "YouTube", icon: "/assets/logos/youtube.svg" },
    {
      value: "NEWS",
      display: "News",
      icon: faNewspaper,
      iconColor: "royalblue",
    },
    {
      value: "SEARCH",
      display: "Web Search",
      icon: "/assets/logos/google.svg",
    },
  ],
  onClick: console.log,
  shuffle: true,
  includeOther: true,
};

export const NoIcons = Template.bind({});
NoIcons.args = {
  choices: [
    { value: 10, display: "10 flashcards" },
    { value: 25, display: "25 flashcards" },
    { value: 50, display: "50 flashcards" },
    { value: 100, display: "100 flashcards" },
  ],
  onClick: console.log,
  numCols: 4,
};

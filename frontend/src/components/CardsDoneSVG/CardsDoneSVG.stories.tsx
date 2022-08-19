import CardsDoneSVG from ".";
import { ComponentStory } from "@storybook/react";

export default {
  title: "Components/CardsDoneSVG",
  component: CardsDoneSVG,
};

const Template: ComponentStory<typeof CardsDoneSVG> = (args) => (
  <CardsDoneSVG {...args} />
);

export const LessThanTarget = Template.bind({});
LessThanTarget.args = {
  targetCardsDone: 50,
  cardsDone: 30,
  cardsJustDone: 0,
};

export const GreaterThanTarget = Template.bind({});
GreaterThanTarget.args = {
  targetCardsDone: 50,
  cardsDone: 80,
  cardsJustDone: 0,
};

export const CardsJustDone = Template.bind({});
CardsJustDone.args = {
  targetCardsDone: 50,
  cardsDone: 60,
  cardsJustDone: 25,
};

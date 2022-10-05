import ReviewsDoneSVG from ".";
import { ComponentStory } from "@storybook/react";

export default {
  title: "Components/CardsDoneSVG",
  component: ReviewsDoneSVG,
};

const Template: ComponentStory<typeof ReviewsDoneSVG> = (args) => (
  <ReviewsDoneSVG {...args} />
);

export const LessThanTarget = Template.bind({});
LessThanTarget.args = {
  targetReviewsDone: 50,
  reviewsDone: 30,
  reviewsJustDone: 0,
};

export const GreaterThanTarget = Template.bind({});
GreaterThanTarget.args = {
  targetReviewsDone: 50,
  reviewsDone: 80,
  reviewsJustDone: 0,
};

export const CardsJustDone = Template.bind({});
CardsJustDone.args = {
  targetReviewsDone: 50,
  reviewsDone: 60,
  reviewsJustDone: 25,
};

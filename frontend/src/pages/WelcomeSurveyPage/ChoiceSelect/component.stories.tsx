import googleLogoUrl from 'assets/logos/google.svg';
import instagramLogoUrl from 'assets/logos/instagram.svg';
import redditLogoUrl from 'assets/logos/reddit.svg';
import tiktokLogoUrl from 'assets/logos/tiktok.svg';
import youtubeLogoUrl from 'assets/logos/youtube.svg';
import { ComponentStory } from '@storybook/react';
import { faGraduationCap, faNewspaper, faPersonChalkboard, faUserGroup } from '@fortawesome/free-solid-svg-icons';

import ChoiceSelect from '.';

export default {
  title: 'Pages/WelcomeSurveyPage/ChoiceSelect',
  component: ChoiceSelect,
}

const Template: ComponentStory<typeof ChoiceSelect> = (args) => <div className='container px-48'>
  <ChoiceSelect {...args} />
</div>;

export const TwoChoices = Template.bind({});
TwoChoices.args = {
  choices: [
    { value: 'STUDENT', display: 'Student', icon: faGraduationCap, iconColor: 'dodgerblue' },
    { value: 'TEACHER', display: 'Teacher', icon: faPersonChalkboard, iconColor: 'indigo' },
  ],
  onClick: console.log,
};

export const ManyChoices = Template.bind({});
ManyChoices.args = {
  choices: [
    { value: 'FRIENDS', display: 'Friends/Family', icon: faUserGroup, iconColor: 'orange' },
    { value: 'TEACHER', display: 'Teacher', icon: faPersonChalkboard, iconColor: 'indigo' },
    { value: 'INSTA', display: 'Instagram', icon: instagramLogoUrl },
    { value: 'REDDIT', display: 'Reddit', icon: redditLogoUrl },
    { value: 'TIKTOK', display: 'TikTok', icon: tiktokLogoUrl },
    { value: 'YOUTUBE', display: 'YouTube', icon: youtubeLogoUrl },
    { value: 'NEWS', display: 'News', icon: faNewspaper, iconColor: 'royalblue' },
    { value: 'SEARCH', display: 'Web Search', icon: googleLogoUrl },
  ],
  onClick: console.log,
  shuffle: true,
  includeOther: true,
};

export const NoIcons = Template.bind({});
NoIcons.args = {
  choices: [
    { value: 10, display: '10 flashcards' },
    { value: 25, display: '25 flashcards' },
    { value: 50, display: '50 flashcards' },
    { value: 100, display: '100 flashcards' },
  ],
  onClick: console.log,
  numCols: 4,
};

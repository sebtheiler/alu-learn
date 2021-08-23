import React, { FunctionComponent } from 'react';
import ReactDOM from 'react-dom';
import * as serviceWorker from './serviceWorker';
import './index.css';

import { ProfileInformationComponent, LoginComponent, StaffForceLogin } from './profiles';
import { DeckPublicList, DeckDetailComponent, DecksHomeComponent, DeckImportComponent, PushSharedDeck, UpdateDeck, StatisticsPage } from './decks';
// import { FlashCardsList, FlashCardSearchComponent } from './decks/flashcards';
// import { StudyComponent } from './decks/study';
import { NotificationComponent } from './profiles/notifications';
import { ExploreComponent, DeckSearchComponent } from './explore';
import { LandingComponent } from './landing';
import { HomeComponent, NavbarComponent, ContactUs, SettingsPage, ChangePasswordEmail, ConfirmEmail, SendPasswordReset, UserCustomization } from './home';
import { GameComponent, MatchingGame } from './decks/games';
import { ClassroomDetail, ClassroomStudentDetail, StudyAssignment } from './teachers';
import { Habits } from './habits';
import { SkillTreeHome, StudySkillTree, ViewFlashcards, CreateFlashcard, ShareDeck, SharedDeckDetail } from './decks/skill-tree';  // TODO: remove this

const e = React.createElement;

const renderElement = (Component: FunctionComponent | string, htmlName: string, isClass=false) => {
  if (isClass) {
    const els: NodeListOf<HTMLElement> = document.querySelectorAll(`.${htmlName}`);
    els.forEach(container => {
      ReactDOM.render(e(Component, container.dataset), container);
    });
  } else {
    const el = document.getElementById(htmlName);
    if (el) {
      ReactDOM.render(e(Component, el.dataset), el);
    }
  }
}


type ElementRow = [FunctionComponent, string, boolean?];
([
  [DeckPublicList, 'user-decks'],
  [DeckDetailComponent, 'deck-detail', true],
  [ProfileInformationComponent, 'profile-info', true],
  [DecksHomeComponent, 'decks-home'],
  // [FlashCardCreate, 'create-flashcard'],
  // [FlashCardsList, 'flashcard-list', true],
  // [StudyComponent, 'study-component'],
  [NotificationComponent, 'notification-component', true],
  [ExploreComponent, 'explore-component'],
  // [FlashCardSearchComponent, 'flashcard-search-component'],
  [DeckSearchComponent, 'deck-search-component'],
  [LandingComponent, 'landing-component', true],
  [HomeComponent, 'home-component'],
  [NavbarComponent, 'navbar-component'],
  [LoginComponent, 'login-component'],
  [DeckImportComponent, 'deck-importer'],
  [ContactUs, 'contact-us'],
  [SettingsPage, 'settings-page'],
  [ChangePasswordEmail, 'update-password-email'],
  [ConfirmEmail, 'confirm-email'],
  [SendPasswordReset, 'send-password-reset'],
  [ShareDeck, 'share-deck'],
  [PushSharedDeck, 'push-deck'],
  [UpdateDeck, 'update-deck'],
  [UserCustomization, 'user-customization'],
  [MatchingGame, 'matching-game'],
  [GameComponent, 'game-component'],
  [StaffForceLogin, 'staff-force-login'],
  [StatisticsPage, 'statistics-page'],
  [ClassroomDetail, 'classroom-detail'],
  [ClassroomStudentDetail, 'classroom-student-detail'],
  [StudyAssignment, 'study-assignment'],
  [Habits, 'habits-component'],
  [SkillTreeHome, 'skill-tree'],
  [StudySkillTree, 'study-skill-tree'],
  [ViewFlashcards, 'view-flashcards'],
  [CreateFlashcard, 'create-flashcard'],
  [SharedDeckDetail, 'shared-deck-detail'],
] as ElementRow[]).map(el => renderElement(...el));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();

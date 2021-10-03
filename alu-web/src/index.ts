import * as serviceWorker from './serviceWorker';
import { SkillTreeHome, StudySkillTree, ViewFlashcards, CreateFlashcard, ShareDeck, SharedDeckDetail, SubmittedList, RenderSubmittedChanges } from './decks/skill-tree';  // TODO: remove this
import { ProfileDetail, LoginComponent, StaffForceLogin } from './profiles';
import { NotificationComponent } from './profiles/notifications';
import { NavbarComponent, ContactUs, SettingsPage, ChangePasswordEmail, ConfirmEmail, SendPasswordReset, UserCustomization, ExploreComponent, LandingComponent } from './pages';
import { Habits } from './habits';
import { GameComponent, MatchingGame } from './decks/games';
import { DeckImportComponent, StatisticsPage } from './decks';
import { ClassroomDetail, ClassroomStudentDetail } from './teachers';
import ReactDOM from 'react-dom';
import React, { FunctionComponent } from 'react';
import './index.css';
import 'bootstrap/dist/css/bootstrap.min.css';

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
  [ProfileDetail, 'profile-detail'],
  [NotificationComponent, 'notification-component', true],
  [ExploreComponent, 'explore-component'],
  [LandingComponent, 'landing-component'],
  [NavbarComponent, 'navbar-component'],
  [LoginComponent, 'login-component'],
  [DeckImportComponent, 'deck-importer'],
  [ContactUs, 'contact-us'],
  [SettingsPage, 'settings-page'],
  [ChangePasswordEmail, 'update-password-email'],
  [ConfirmEmail, 'confirm-email'],
  [SendPasswordReset, 'send-password-reset'],
  [ShareDeck, 'share-deck'],
  [UserCustomization, 'user-customization'],
  [MatchingGame, 'matching-game'],
  [GameComponent, 'game-component'],
  [StaffForceLogin, 'staff-force-login'],
  [StatisticsPage, 'statistics-page'],
  [ClassroomDetail, 'classroom-detail'],
  [ClassroomStudentDetail, 'classroom-student-detail'],
  [Habits, 'habits-component'],
  [SkillTreeHome, 'skill-tree'],
  [StudySkillTree, 'study-skill-tree'],
  [ViewFlashcards, 'view-flashcards'],
  [CreateFlashcard, 'create-flashcard'],
  [SharedDeckDetail, 'shared-deck-detail'],
  [SubmittedList, 'submitted-list'],
  [RenderSubmittedChanges, 'submitted-changes'],
] as ElementRow[]).map(el => renderElement(...el));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();

import * as serviceWorker from './serviceWorker';
import React, { FunctionComponent } from 'react';
import ReactDOM from 'react-dom';
import { DeckImportComponent, StatisticsPage, SkillTreeHome, StudySkillTree, ViewFlashcards, CreateFlashcard, ShareDeck, SharedDeckDetail, SubmittedList, RenderSubmittedChanges, ArchivedDecks } from './decks';
import { GameComponent, MatchingGame } from './decks/games';
import { Habits } from './habits';
import { NavbarComponent, ContactUs, SettingsPage, ChangePasswordEmail, ConfirmEmail, SendPasswordReset, UserCustomization, ExploreComponent, LandingComponent, ProUpgrade, ProPurchaseSuccess, ProPurchaseCancelled } from './pages';
import { NotificationComponent } from './profiles/notifications';
import { ProfileDetail, LoginComponent, StaffForceLogin } from './profiles';
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
  [ArchivedDecks, 'archived-decks'],
  [ChangePasswordEmail, 'update-password-email'],
  [ConfirmEmail, 'confirm-email'],
  [ContactUs, 'contact-us'],
  [CreateFlashcard, 'create-flashcard'],
  [DeckImportComponent, 'deck-importer'],
  [ExploreComponent, 'explore-component'],
  [GameComponent, 'game-component'],
  [Habits, 'habits-component'],
  [LandingComponent, 'landing-component'],
  [LoginComponent, 'login-component'],
  [MatchingGame, 'matching-game'],
  [NavbarComponent, 'navbar-component'],
  [NotificationComponent, 'notification-component', true],
  [ProUpgrade, 'pro-upgrade'],
  [ProPurchaseCancelled, 'pro-purchase-cancelled'],
  [ProPurchaseSuccess, 'pro-purchase-success'],
  [ProfileDetail, 'profile-detail'],
  [RenderSubmittedChanges, 'submitted-changes'],
  [SendPasswordReset, 'send-password-reset'],
  [SettingsPage, 'settings-page'],
  [ShareDeck, 'share-deck'],
  [SharedDeckDetail, 'shared-deck-detail'],
  [SkillTreeHome, 'skill-tree'],
  [StaffForceLogin, 'staff-force-login'],
  [StatisticsPage, 'statistics-page'],
  [StudySkillTree, 'study-skill-tree'],
  [SubmittedList, 'submitted-list'],
  [UserCustomization, 'user-customization'],
  [ViewFlashcards, 'view-flashcards'],
] as ElementRow[]).map(el => renderElement(...el));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();

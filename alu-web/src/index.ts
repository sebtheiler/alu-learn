import * as serviceWorker from './serviceWorker';
import React, { FunctionComponent } from 'react';
import { createRoot } from 'react-dom/client';
import { DeckImportComponent, StatisticsPage, SkillTreeHome, StudySkillTree, ViewFlashcards, CreateFlashcard, ShareDeck, SharedDeckDetail, SubmittedList, RenderSubmittedChanges, ArchivedDecks } from './decks';
import { GameComponent, MatchingGame } from './decks/games';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Habits } from './habits';
import { NavbarComponent, ContactUs, SettingsPage, ChangePasswordEmail, ConfirmEmail, SendPasswordReset, UserCustomization, ExploreComponent, LandingComponent, AboutPage, ProUpgrade, ProPurchaseSuccess, ProPurchaseCancelled } from './pages';
import { NotificationComponent } from './profiles/notifications';
import { ProfileDetail, LoginComponent, StaffForceLogin } from './profiles';
import './index.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const e = (type, props) => React.createElement(
  GoogleOAuthProvider,  // wrap application in `GoogleOAuthProvider`
  {
    clientId: process.env.REACT_APP_GOOGLE_OAUTH_CLIENT_ID as string,
    children: React.createElement(type, props),
  },
);

const container = document.getElementById('app');
const renderElement = (Component: FunctionComponent | string, htmlName: string, isClass=false) => {
  if (isClass) {
    const els: NodeListOf<HTMLElement> = document.querySelectorAll(`.${htmlName}`);
    els.forEach(el => {
      const root = createRoot(el);
      root.render(e(Component, el.dataset));
    });
  } else {
    const el = document.getElementById(htmlName);
    if (el) {
      const root = createRoot(el);
      root.render(e(Component, el.dataset));
    }
  }
}


type ElementRow = [FunctionComponent, string, boolean?];
([
  [AboutPage, 'about-page'],
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

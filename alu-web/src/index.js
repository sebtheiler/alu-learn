import React from 'react';
import ReactDOM from 'react-dom';
import * as serviceWorker from './serviceWorker';
import './index.css';

import { ProfileInformationComponent, LoginComponent, StaffForceLogin } from './profiles';
import { DeckPublicList, DeckDetailComponent, DecksHomeComponent, DeckImportComponent, ShareDeck, PushSharedDeck, UpdateDeck, StatisticsPage } from './decks';
import { FlashCardCreate, FlashCardsList, FlashCardSearchComponent } from './decks/flashcards';
import { StudyComponent } from './decks/study';
import { NotificationComponent } from './profiles/notifications';
import { ExploreComponent, DeckSearchComponent } from './explore';
import { LandingComponent } from './landing';
import { HomeComponent, NavbarComponent, ContactUs, SettingsPage, ChangePasswordEmail, ConfirmEmail, SendPasswordReset, UserCustomization } from './home';
import { NoteEditor, NotesHomeList } from './notes';
import { AutoNote, AutoFlashCard } from './notes/autonote';
import { ManualSRHome } from './manual-sr';
import { GameComponent, MatchingGame } from './decks/games';
import { ClassroomDetail, ClassroomsHomepage, ClassroomStudentDetail } from './teachers';

const e = React.createElement;

const renderElement = (Element, htmlName, isClass=false) => {
  if (isClass) {
    const els = document.querySelectorAll(`.${htmlName}`);
    els.forEach(container => {
      ReactDOM.render(e(Element, container.dataset), container);
    });
  } else {
    const el = document.getElementById(htmlName);
    if (el) {
      ReactDOM.render(e(Element, el.dataset), el);
    }
  }
}

[
  [DeckPublicList, 'user-decks'],
  [DeckDetailComponent, 'deck-detail', true],
  [ProfileInformationComponent, 'profile-info', true],
  [DecksHomeComponent, 'decks-home'],
  [FlashCardCreate, 'create-flashcard'],
  [FlashCardsList, 'flashcard-list', true],
  [StudyComponent, 'study-component'],
  [NotificationComponent, 'notification-component', true],
  [ExploreComponent, 'explore-component'],
  [FlashCardSearchComponent, 'flashcard-search-component'],
  [DeckSearchComponent, 'deck-search-component'],
  [LandingComponent, 'landing-component', true],
  [HomeComponent, 'home-component'],
  [NavbarComponent, 'navbar-component'],
  [LoginComponent, 'login-component'],
  [DeckImportComponent, 'deck-importer'],
  [ContactUs, 'contact-us'],
  [NoteEditor, 'note-editor'],
  [NotesHomeList, 'notes-home'],
  [SettingsPage, 'settings-page'],
  [ChangePasswordEmail, 'update-password-email'],
  [ConfirmEmail, 'confirm-email'],
  [SendPasswordReset, 'send-password-reset'],
  [AutoNote, 'auto-note'],
  [AutoFlashCard, 'auto-flashcard'],
  [ManualSRHome, 'manual-sr-home'],
  [ShareDeck, 'share-deck'],
  [PushSharedDeck, 'push-deck'],
  [UpdateDeck, 'update-deck'],
  [UserCustomization, 'user-customization'],
  [MatchingGame, 'matching-game'],
  [GameComponent, 'game-component'],
  [StaffForceLogin, 'staff-force-login'],
  [StatisticsPage, 'statistics-page'],
  [ClassroomsHomepage, 'classrooms-homepage'],
  [ClassroomDetail, 'classroom-detail'],
  [ClassroomStudentDetail, 'classroom-student-detail'],
].map(el => renderElement(...el));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();

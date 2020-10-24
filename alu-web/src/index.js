import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import * as serviceWorker from './serviceWorker';
import {ProfileInformationComponent, LoginComponent} from './profiles';
import {DeckPublicList, DeckDetailComponent, DecksHomeComponent, DeckImportComponent, ShareDeck} from './decks';
import {FlashCardCreate, FlashCardsList, FlashCardSearchComponent} from './decks/flashcards';
import {StudyComponent} from './decks/study';
import {NotificationComponent} from './profiles/notifications';
import {ExploreComponent, DeckSearchComponent} from './explore';
import {LandingComponent} from './landing';
import {HomeComponent, NavbarComponent, ContactUs, SettingsPage, ChangePasswordEmail, ConfirmEmail, SendPasswordReset} from './home';
import {NoteEditor, NotesHomeList} from './notes';
import {AutoNote, AutoFlashCard} from './notes/autonote';
import {ManualSRHome} from './manual-sr';

const e = React.createElement;

const decksEl = document.getElementById('user-decks');
if (decksEl) {
  ReactDOM.render(e(DeckPublicList, decksEl.dataset), decksEl);
};

const deckDetailElements = document.querySelectorAll('.deck-detail');
deckDetailElements.forEach(container => {
  ReactDOM.render(e(DeckDetailComponent, container.dataset), container);
});

const userProfileInfoElements = document.querySelectorAll('.profile-info');
userProfileInfoElements.forEach(container => {
  ReactDOM.render(e(ProfileInformationComponent, container.dataset), container);
});

const deckHomeElement = document.getElementById('decks-home');
if (deckHomeElement) {
  ReactDOM.render(e(DecksHomeComponent, deckHomeElement.dataset), deckHomeElement);
};

const flashcardCreateElement = document.getElementById('create-flashcard');
if (flashcardCreateElement) {
  ReactDOM.render(e(FlashCardCreate, flashcardCreateElement.dataset), flashcardCreateElement);
};

const flashcardListElement = document.querySelectorAll('.flashcard-list');
flashcardListElement.forEach(container => {
  ReactDOM.render(e(FlashCardsList, container.dataset), container);
});

const flashcardStudyElement = document.getElementById('study-component');
if (flashcardStudyElement) {
  ReactDOM.render(e(StudyComponent, flashcardStudyElement.dataset), flashcardStudyElement);
};

const notificationElements = document.querySelectorAll('.notification-component');
notificationElements.forEach(container => {
  ReactDOM.render(e(NotificationComponent, container.dataset), container);
});

const exploreElement = document.getElementById('explore-component');
if (exploreElement) {
  ReactDOM.render(e(ExploreComponent, exploreElement.dataset), exploreElement);
};

const flashcardSearchElement = document.getElementById('flashcard-search-component');
if (flashcardSearchElement) {
  ReactDOM.render(e(FlashCardSearchComponent, flashcardSearchElement.dataset), flashcardSearchElement);
};

const deckSearchElement = document.getElementById('deck-search-component');
if (deckSearchElement) {
  ReactDOM.render(e(DeckSearchComponent, deckSearchElement.dataset), deckSearchElement);
};

const landingComponents = document.querySelectorAll('.landing-component');
landingComponents.forEach(container => {
  ReactDOM.render(e(LandingComponent, container.dataset), container);
});

const homeElement = document.getElementById('home-component');
if (homeElement) {
  ReactDOM.render(e(HomeComponent, homeElement.dataset), homeElement);
};

const navbarElement = document.getElementById('navbar-component');
if (navbarElement) {
  ReactDOM.render(e(NavbarComponent, navbarElement.dataset), navbarElement);
};

const loginElement = document.getElementById('login-component');
if (loginElement) {
  ReactDOM.render(e(LoginComponent, loginElement.dataset), loginElement);
};

const importElement = document.getElementById('deck-importer');
if (importElement) {
  ReactDOM.render(e(DeckImportComponent, importElement.dataset), importElement);
};

const contactElement = document.getElementById('contact-us');
if (contactElement) {
  ReactDOM.render(e(ContactUs, contactElement.dataset), contactElement);
};

const noteEditorElement = document.getElementById('note-editor');
if (noteEditorElement) {
  ReactDOM.render(e(NoteEditor, noteEditorElement.dataset), noteEditorElement);
};

const notesHomeElement = document.getElementById('notes-home');
if (notesHomeElement) {
  ReactDOM.render(e(NotesHomeList, notesHomeElement.dataset), notesHomeElement);
};

const settingsElement = document.getElementById('settings-page');
if (settingsElement) {
  ReactDOM.render(e(SettingsPage, settingsElement.dataset), settingsElement);
};

const updatePasswordEmailElement = document.getElementById('update-password-email');
if (updatePasswordEmailElement) {
  ReactDOM.render(e(ChangePasswordEmail, updatePasswordEmailElement.dataset), updatePasswordEmailElement);
};

const confirmEmailElement = document.getElementById('confirm-email');
if (confirmEmailElement) {
  ReactDOM.render(e(ConfirmEmail, confirmEmailElement.dataset), confirmEmailElement);
};

const sendPasswordResetElement = document.getElementById('send-password-reset');
if (sendPasswordResetElement) {
  ReactDOM.render(e(SendPasswordReset, sendPasswordResetElement.dataset), sendPasswordResetElement);
};

const autoNoteElement = document.getElementById('auto-note');
if (autoNoteElement) {
  ReactDOM.render(e(AutoNote, autoNoteElement.dataset), autoNoteElement);
};

const autoFlashCardElement = document.getElementById('auto-flashcard');
if (autoFlashCardElement) {
  ReactDOM.render(e(AutoFlashCard, autoFlashCardElement.dataset), autoFlashCardElement);
};

const manualSRHomeElement = document.getElementById('manual-sr-home');
if (manualSRHomeElement) {
  ReactDOM.render(e(ManualSRHome, manualSRHomeElement.dataset), manualSRHomeElement);
};

const shareDeckElement = document.getElementById('share-deck');
if (shareDeckElement) {
  ReactDOM.render(e(ShareDeck, shareDeckElement.dataset), shareDeckElement);
};

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();

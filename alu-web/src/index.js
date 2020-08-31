import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import * as serviceWorker from './serviceWorker';
import {ProfileInformationComponent} from './profiles';
import {DecksComponent, DeckDetailComponent, DecksHomeComponent} from './decks';
import {FlashCardCreateComponent, FlashCardsList, FlashCardSearchComponent} from './decks/flashcards';
import {StudyComponent, CustomStudyComponent} from './decks/study';
import {NotificationComponent} from './profiles/notifications';
import {ExploreComponent, DeckSearchComponent} from './explore';
import {LandingComponent} from './landing';

const e = React.createElement;

const decksEl = document.getElementById('user_decks');
if (decksEl) {
  ReactDOM.render(e(DecksComponent, decksEl.dataset), decksEl);
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
  ReactDOM.render(e(FlashCardCreateComponent, flashcardCreateElement.dataset), flashcardCreateElement);
};

const flashcardListElement = document.querySelectorAll('.flashcard-list');
flashcardListElement.forEach(container => {
  ReactDOM.render(e(FlashCardsList, container.dataset), container);
});

const flashcardStudyElement = document.getElementById('study-component');
if (flashcardStudyElement) {
  ReactDOM.render(e(StudyComponent, flashcardStudyElement.dataset), flashcardStudyElement);
};

const customFlashcardStudyElement = document.getElementById('custom-study-component');
if (customFlashcardStudyElement) {
  ReactDOM.render(e(CustomStudyComponent, customFlashcardStudyElement.dataset), customFlashcardStudyElement);
};

const notificationElements = document.querySelectorAll('.notification-component');
notificationElements.forEach(container => {
  ReactDOM.render(e(NotificationComponent, container.dataset), container);
});

const exploreElement = document.getElementById('explore-component')
if (exploreElement) {
  ReactDOM.render(e(ExploreComponent, exploreElement.dataset), exploreElement);
};

const flashcardSearchElement = document.getElementById('flashcard-search-component')
if (flashcardSearchElement) {
  ReactDOM.render(e(FlashCardSearchComponent, flashcardSearchElement.dataset), flashcardSearchElement);
};

const deckSearchElement = document.getElementById('deck-search-component')
if (deckSearchElement) {
  ReactDOM.render(e(DeckSearchComponent, deckSearchElement.dataset), deckSearchElement);
};

const landingComponents = document.querySelectorAll('.landing-component');
landingComponents.forEach(container => {
  ReactDOM.render(e(LandingComponent, container.dataset), container);
});

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();

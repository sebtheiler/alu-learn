import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import * as serviceWorker from './serviceWorker';
import {ProfileBadgeComponent} from './profiles';
import {DecksComponent, DeckDetailComponent, DecksFeedComponent} from './decks';
import {FlashCardCreateComponent} from './flashcards';

const e = React.createElement;

const decksEl = document.getElementById('user_decks');
if (decksEl) {
  ReactDOM.render(e(DecksComponent, decksEl.dataset), decksEl);
};

const deckDetailElements = document.querySelectorAll('.deck-detail');
deckDetailElements.forEach(container => {
  ReactDOM.render(e(DeckDetailComponent, container.dataset), container);
});

const userProfileBadgeElements = document.querySelectorAll('.profile-badge');
userProfileBadgeElements.forEach(container => {
  ReactDOM.render(e(ProfileBadgeComponent, container.dataset), container);
});

const deckFeedElement = document.getElementById('decks-feed');
if (deckFeedElement) {
  ReactDOM.render(e(DecksFeedComponent, deckFeedElement.dataset), deckFeedElement);
};

const flashcardCreateElement = document.getElementById('create-flashcard');
if (flashcardCreateElement) {
  ReactDOM.render(e(FlashCardCreateComponent, flashcardCreateElement.dataset), flashcardCreateElement);
};

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();

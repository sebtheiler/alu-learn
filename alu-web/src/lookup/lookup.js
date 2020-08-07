import {backendLookup} from './components';

export function apiDeckCreate(newDeck, callback) {
  backendLookup('POST', 'decks/create/', callback, {title: newDeck});
};

export function apiDeckDetail(deckId, callback) {
  backendLookup('GET', `decks/${deckId}/`, callback);
};

export function apiDeckList(username, callback, nextUrl) {
  let endpoint = 'decks/decklist/';
  if (username) {
    endpoint = `decks/decklist/?username=${username}`;
  };
  if (nextUrl !== null && nextUrl !== undefined) {
    // TODO: The replace system will need to be redone
    endpoint = nextUrl.replace('http://127.0.0.1:8000/api/', '');
  };
  backendLookup('GET', endpoint, callback);
};

export function apiDeckFeed(callback, nextUrl) {
  let endpoint = 'decks/feed/';
  if (nextUrl !== null && nextUrl !== undefined) {
    // TODO: The replace system will need to be redone
    endpoint = nextUrl.replace('http://127.0.0.1:8000/api/', '');
  };
  backendLookup('GET', endpoint, callback);
};

export function apiProfileDetail(username, callback) {
  backendLookup('GET', `profiles/${username}/detail/`, callback);
};

export function apiProfileFriendToggle(username, action, callback) {
  backendLookup('POST', `profiles/${username}/friend/`, callback, {action: `${action && action}`.toLowerCase()});
};
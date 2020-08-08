import {backendLookup} from './components';


// Creates a new deck with the title, `newDeck`
export function apiDeckCreate(newDeck, callback) {
  backendLookup('POST', 'decks/create/', callback, {title: newDeck});
};


// Gets detail information on a deck with ID `deckId`
export function apiDeckDetail(deckId, callback) {
  backendLookup('GET', `decks/${deckId}/`, callback);
};


// Gets a list of decks owned by a user with username `username`
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


// Gets a feed of decks from the API
export function apiDeckFeed(callback, nextUrl) {
  let endpoint = 'decks/feed/';
  if (nextUrl !== null && nextUrl !== undefined) {
    // TODO: The replace system will need to be redone
    endpoint = nextUrl.replace('http://127.0.0.1:8000/api/', '');
  };
  backendLookup('GET', endpoint, callback);
};


// Gets detail information about a profile, such as bio, name, username, etc.
export function apiProfileDetail(username, callback) {
  backendLookup('GET', `profiles/${username}/detail/`, callback);
};


// Sends a friend/unfriend request to the backend
export function apiProfileFriendToggle(username, action, callback) {
  backendLookup('POST', `profiles/${username}/friend/`, callback, {action: action.toLowerCase()});
};
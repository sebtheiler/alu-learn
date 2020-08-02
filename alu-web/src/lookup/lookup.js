import {backendLookup} from './components';

export function apiDeckCreate(newDeck, callback) {
  backendLookup('POST', 'create/', callback, {title: newDeck});
};

export function apiDeckDetail(deckId, callback) {
  backendLookup('GET', `${deckId}/`, callback);
};

export function apiDeckList(username, callback) {
  let endpoint = 'decklist/';
  if (username) {
    endpoint = `decklist/?username=${username}`;
  };
  backendLookup('GET', endpoint, callback);
};
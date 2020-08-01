import {backendLookup} from './components';

export function apiDeckCreate(newDeck, callback) {
  backendLookup('POST', 'create/', callback, {title: newDeck});
};

export function apiDeckList(callback) {
  backendLookup('GET', 'decklist/', callback);
};
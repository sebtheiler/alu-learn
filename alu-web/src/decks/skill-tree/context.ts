import { createContext, Dispatch } from 'react';
import { Deck } from '../types';

type DeckAction = 'CREATE' | 'EDIT' | 'DELETE';
export const deckReducer = (
  state: Deck[] | undefined,
  event: { action: DeckAction, payload?: any },
): Deck[] | undefined => {
  if (!state) return undefined;
  switch (event.action) {
    case 'CREATE':
      // `payload`: The newly created deck
      return [...state, event.payload as Deck];
    case 'EDIT':
      // `payload`: List of edited attributes and their new values (and the deck's ID)
      // Get index of edited deck
      const index = state.map(deck => deck.id).indexOf(event.payload.id);

      // Make updates
      let newState = state;
      for (const [attr, val] of Object.entries(event.payload))
        newState[index][attr] = val;

      return [...newState];  // React is very stupid so you need to clone the array to force re-render
    case 'DELETE':
      return state; // TODO
    default:
      return state;
  }
}

export const DeckDispatch = createContext<Dispatch<{
  action: DeckAction,
  payload?: any,
}> | undefined>(undefined);

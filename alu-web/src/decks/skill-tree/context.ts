import { createContext, Dispatch } from 'react';
import { Deck } from '../types';
import { MainSection, SubSection } from './types';

type DeckEvent =
  // Deck
  | { action: 'CREATE', payload: Deck }
  | { action: 'EDIT', payload: any }
  | { action: 'DELETE', payload: number }
  // MainSection
  | { action: 'CREATE_MAIN_SECTION', deckId: number, mainSection: MainSection }
  | { action: 'EDIT_MAIN_SECTION', deckId: number, mainSection: Partial<MainSection> & Pick<MainSection, 'id'> }
  | { action: 'DELETE_MAIN_SECTION', deckId: number, mainSectionId: number }
  // SubSection
  | { action: 'CREATE_SUB_SECTION', deckId: number, mainSectionId: number, subSection: SubSection }
  | { action: 'EDIT_SUB_SECTION', deckId: number, mainSectionId: number, subSection: Partial<SubSection> & Pick<SubSection, 'id'> }
  | { action: 'DELETE_SUB_SECTION', deckId: number, mainSectionId: number, subSectionId: number }

export const deckReducer = (
  state: Deck[] | undefined,
  event: DeckEvent,
): Deck[] | undefined => {
  if (!state) return undefined;
  let index: number;
  let mainSectionIndex: number
  let newState = state;
  switch (event.action) {
    case 'CREATE':
      return [...state, event.payload];
    case 'EDIT':
      // Get index of edited deck
      index = state.map(deck => deck.id).indexOf(event.payload.id);

      // Make updates
      for (const [attr, val] of Object.entries(event.payload))
        newState[index][attr] = val;

      return [...newState];  // React is very stupid so you need to clone the array to force re-render
    case 'DELETE':
      return state.filter(deck => deck.id !== event.payload);
    case 'CREATE_MAIN_SECTION':
      index = state.map(deck => deck.id).indexOf(event.deckId);
      newState[index].skill_tree_sections.push(event.mainSection);

      return [...newState];
    case 'EDIT_MAIN_SECTION':
      // Get index of edited deck and of edited main section
      index = state.map(deck => deck.id).indexOf(event.deckId);
      mainSectionIndex = newState[index].skill_tree_sections.map(
        ms => ms.id
      ).indexOf(event.mainSection.id);

      // Make updates
      for (const [attr, val] of Object.entries(event.mainSection))
        newState[index].skill_tree_sections[mainSectionIndex][attr] = val;

      return [...newState];
    case 'DELETE_MAIN_SECTION':
      index = state.map(deck => deck.id).indexOf(event.deckId);
      newState[index].skill_tree_sections = newState[index].skill_tree_sections.filter(
        ms => ms.id !== event.mainSectionId
      );

      return [...newState];
    case 'CREATE_SUB_SECTION':
      index = state.map(deck => deck.id).indexOf(event.deckId);
      mainSectionIndex = state[index].skill_tree_sections.map(
        ms => ms.id
      ).indexOf(event.mainSectionId);
      newState[index].skill_tree_sections[mainSectionIndex].children.push(event.subSection);

      return [...newState];
    case 'EDIT_SUB_SECTION':
      // Get index of edited deck and of edited main section
      index = state.map(deck => deck.id).indexOf(event.deckId);
      mainSectionIndex = state[index].skill_tree_sections.map(
        ms => ms.id
      ).indexOf(event.mainSectionId);
      const subSectionIndex = newState[index].skill_tree_sections[mainSectionIndex].children.map(
        ss => ss.id
      ).indexOf(event.subSection.id);

      // Make updates
      for (const [attr, val] of Object.entries(event.subSection))
        newState[index].skill_tree_sections[mainSectionIndex].children[subSectionIndex][attr] = val;

      return [...newState];
    case 'DELETE_SUB_SECTION':
      index = state.map(deck => deck.id).indexOf(event.deckId);
      mainSectionIndex = state[index].skill_tree_sections.map(
        ms => ms.id
      ).indexOf(event.mainSectionId);
      newState[index].skill_tree_sections[mainSectionIndex].children =
        newState[index].skill_tree_sections[mainSectionIndex].children.filter(
          ss => ss.id !== event.subSectionId
        );

      return [...newState];
    default:
      return state;
  }
}

export const DeckDispatch = createContext<Dispatch<DeckEvent> | undefined>(undefined);

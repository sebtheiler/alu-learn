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
  | { action: 'DELETE_MAIN_SECTION', deckId: number, mainSectionId: string }
  | { action: 'MOVE_MAIN_SECTION', deckId: number, mainSectionId: string, mainSectionNum: number, direction: 'UP' | 'DOWN' }
  // SubSection
  | { action: 'CREATE_SUB_SECTION', deckId: number, mainSectionId: string, subSection: SubSection }
  | { action: 'EDIT_SUB_SECTION', deckId: number, mainSectionId: string, subSection: Partial<SubSection> & Pick<SubSection, 'id'> }
  | { action: 'DELETE_SUB_SECTION', deckId: number, mainSectionId: string, subSectionId: string }
  | { action: 'MOVE_SUB_SECTION', deckId: number, mainSectionId: string, subSectionId: string, subSectionNum: number, direction: 'UP' | 'DOWN' }

export const deckReducer = (
  state: Deck[] | undefined,
  event: DeckEvent,
): Deck[] | undefined => {
  if (!state) return undefined;
  let index: number;
  let mainSectionIndex: number
  let subSectionIndex: number
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
      if (!newState[index].main_sections.includes(event.mainSection))
        newState[index].main_sections.push(event.mainSection);

      return [...newState];
    case 'EDIT_MAIN_SECTION':
      // Get index of edited deck and of edited main section
      index = state.map(deck => deck.id).indexOf(event.deckId);
      mainSectionIndex = newState[index].main_sections.map(
        ms => ms.id
      ).indexOf(event.mainSection.id);

      // Make updates
      for (const [attr, val] of Object.entries(event.mainSection))
        newState[index].main_sections[mainSectionIndex][attr] = val;

      return [...newState];
    case 'DELETE_MAIN_SECTION':
      index = state.map(deck => deck.id).indexOf(event.deckId);
      newState[index].main_sections = newState[index].main_sections.filter(
        ms => ms.id !== event.mainSectionId
      );

      return [...newState];
    case 'MOVE_MAIN_SECTION':
      index = state.map(deck => deck.id).indexOf(event.deckId);

      mainSectionIndex = newState[index].main_sections.map(
        ms => ms.id
      ).indexOf(event.mainSectionId);

      // We need this check to prevent firing twice
      if (
        state[index].main_sections[mainSectionIndex].order_num
        !==
        event.mainSectionNum
      ) return [...newState];

      // Move
      if (event.direction === 'UP') {
        newState[index].main_sections[mainSectionIndex].order_num--;
        newState[index].main_sections[mainSectionIndex - 1].order_num++;
      } else {
        newState[index].main_sections[mainSectionIndex].order_num++;
        newState[index].main_sections[mainSectionIndex + 1].order_num--;
      }
      newState[index].main_sections = newState[index].main_sections.sort(
        (a, b) => a.order_num - b.order_num,
      );

      return [...newState];
    case 'CREATE_SUB_SECTION':
      index = state.map(deck => deck.id).indexOf(event.deckId);
      mainSectionIndex = state[index].main_sections.map(
        ms => ms.id
      ).indexOf(event.mainSectionId);
      if (!newState[index].main_sections[mainSectionIndex].sub_sections.includes(event.subSection))
        newState[index].main_sections[mainSectionIndex].sub_sections.push(event.subSection);

      return [...newState];
    case 'EDIT_SUB_SECTION':
      // Get index of edited deck and of edited main section
      index = state.map(deck => deck.id).indexOf(event.deckId);
      mainSectionIndex = state[index].main_sections.map(
        ms => ms.id
      ).indexOf(event.mainSectionId);
      subSectionIndex = newState[index].main_sections[mainSectionIndex].sub_sections.map(
        ss => ss.id
      ).indexOf(event.subSection.id);

      // Make updates
      for (const [attr, val] of Object.entries(event.subSection))
        newState[index].main_sections[mainSectionIndex].sub_sections[subSectionIndex][attr] = val;

      return [...newState];
    case 'DELETE_SUB_SECTION':
      index = state.map(deck => deck.id).indexOf(event.deckId);
      mainSectionIndex = state[index].main_sections.map(
        ms => ms.id
      ).indexOf(event.mainSectionId);
      newState[index].main_sections[mainSectionIndex].sub_sections =
        newState[index].main_sections[mainSectionIndex].sub_sections.filter(
          ss => ss.id !== event.subSectionId
        );

      return [...newState];
    case 'MOVE_SUB_SECTION':
      index = state.map(deck => deck.id).indexOf(event.deckId);

      mainSectionIndex = newState[index].main_sections.map(
        ms => ms.id
      ).indexOf(event.mainSectionId);
      subSectionIndex = newState[index].main_sections[mainSectionIndex].sub_sections.map(
        ss => ss.id
      ).indexOf(event.subSectionId);

      // We need this check to prevent firing twice
      if (
        state[index].main_sections[mainSectionIndex].sub_sections[subSectionIndex].order_num
        !==
        event.subSectionNum
      ) return [...newState];

      // Move
      if (event.direction === 'UP') {
        newState[index].main_sections[mainSectionIndex].sub_sections[subSectionIndex].order_num--;
        newState[index].main_sections[mainSectionIndex].sub_sections[subSectionIndex - 1].order_num++;
      } else {
        newState[index].main_sections[mainSectionIndex].sub_sections[subSectionIndex].order_num++;
        newState[index].main_sections[mainSectionIndex].sub_sections[subSectionIndex + 1].order_num--;
      }
      newState[index].main_sections[mainSectionIndex].sub_sections = newState[index].main_sections[mainSectionIndex].sub_sections.sort(
        (a, b) => a.order_num - b.order_num,
      );

      return [...newState];
    default:
      return state;
  }
}

export const DeckDispatch = createContext<Dispatch<DeckEvent> | undefined>(undefined);

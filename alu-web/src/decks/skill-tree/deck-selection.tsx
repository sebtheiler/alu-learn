import React, { useState } from 'react';
import { Deck } from '../types';
import './deck-selection.css';
import DeckSelectionButtons from './buttons/deck-selection';

interface DeckSelectionProps {
  deck: Deck;
  onClick(): void;
  selected: boolean;
}
export default function DeckSelection(props: DeckSelectionProps) {
  const { deck, onClick, selected } = props;
  const [dropdownExpanded, setDropdownExpanded] = useState(false);

  return (
    <div
      className='deck-selection-item'
      role='button'
      onClick={() => selected ? setDropdownExpanded(!dropdownExpanded) : onClick()}
    >
      <div
        className={'deck-selection-main mb-0' + (selected ? ' deck-selection-main-selected' : '')}
      >
        <span className='mb-0'>{deck.title}</span>
        <span
          role='button'
          onClick={e => {e.stopPropagation(); setDropdownExpanded(!dropdownExpanded);}}
          aria-controls={`collapse-deck-selection-${deck.id}`}
          aria-expanded={dropdownExpanded}
        >
          <i className='fas fa-cog fa-2x float-left mt-2 ml-2' />
        </span>
      </div>
      <div className='mb-2'>
        <DeckSelectionButtons
          collapse={dropdownExpanded}
          deck={deck}
        />
      </div>
    </div>
  );
}

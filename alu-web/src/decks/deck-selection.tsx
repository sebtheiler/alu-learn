import DeckSelectionButtons from './buttons/deck-selection';
import { Deck } from './types';
import { useState } from 'react';
import './deck-selection.scss';

interface DeckSelectionProps {
  deck: Deck;
  onClick(): void;
  selected: boolean;
}
export default function DeckSelection(props: DeckSelectionProps) {
  const { deck, onClick, selected } = props;
  const [dropdownExpanded, setDropdownExpanded] = useState(false);

  return (
    <div className='deck-selection-item'>
      <div
        className={'deck-selection-main mb-0' + (selected ? ' selected' : '')}
        role='button'
        onClick={() => selected ? setDropdownExpanded(!dropdownExpanded) : onClick()}
      >
        <p>
          <span className='title-text'>{deck.title}</span>
          <span
            role='button'
            onClick={e => {e.stopPropagation(); setDropdownExpanded(!dropdownExpanded);}}
            aria-controls={`collapse-deck-selection-${deck.id}`}
            aria-expanded={dropdownExpanded}
          >
            <i className='fas fa-cog fa-2x float-left mt-2 ml-2' />
          </span>
        </p>
      </div>
      <DeckSelectionButtons
        collapse={dropdownExpanded}
        deck={deck}
      />
    </div>
  );
}

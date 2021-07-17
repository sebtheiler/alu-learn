import React, { useState } from 'react';
import { Deck, CSSM } from '../types';
import Collapse from 'react-bootstrap/Collapse';
import './deck-selection.css';
import { DeckDefaultButtonGroup } from '../buttons';

interface DeckSelectionProps {
  deck: Deck | CSSM;
}
export default function DeckSelection(props: DeckSelectionProps) {
  const { deck } = props;
  const [open, setOpen] = useState(false);

  return (
    <div className='deck-selection-item'>
      <div className='deck-selection-main mb-0'>
        <span className='mb-0'>{deck.title}</span>
        <span
          role='button'
          onClick={() => setOpen(!open)}
          aria-controls={`collapse-deck-selection-${deck.id}`}
          aria-expanded={open}
        >
          <i className='fas fa-cog fa-2x float-left mt-2 ml-2' />
        </span>
      </div>
      <div className='mb-2'>
        <Collapse in={open}>
          <div id={`collapse-deck-selection-${deck.id}`} className='deck-selection-expand mb-1'>
            <DeckDefaultButtonGroup
              deck={deck}
              vertical
            />
          </div>
        </Collapse>
      </div>
    </div>
  );
}

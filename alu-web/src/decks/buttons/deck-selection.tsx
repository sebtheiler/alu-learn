import Button from 'react-bootstrap/Button';
import Collapse from 'react-bootstrap/Collapse';
import EditModal from '../modals/edit';
import { Deck } from '../types';
import { ExportModal, GameModal } from '../buttons';
import { useState } from 'react';

interface DeckSelectionButtonsProps {
  deck: Deck;
  collapse: boolean;
}
export default function DeckSelectionButtons(props: DeckSelectionButtonsProps) {
  const { deck, collapse } = props;

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [gameModalOpen, setGameModalOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);

  const gameSubmitHandler = event => {
    event.preventDefault();
    const form = event.target;
    let gameOptions = '';
    gameOptions += `game=${form.elements.gameType.value}`;
    gameOptions += `&flashcards=${form.elements.flashcardType.value}`;
    if (form.elements.flashcardType.value === 'TAG') {
      gameOptions += `&tag=${form.elements.tagToSearch.value}`;
    }
    switch (form.elements.gameType.value) {
      case 'MATCHING':
        gameOptions += `&size=${form.elements.size.value}`;
        break;
      case 'QUIZ':
      case 'CRAM':
        gameOptions += `&num=${form.elements.num.value}`;
        break;
      default:
        break;
    }
    gameOptions += `&random=${form.elements.randomOrder?.checked}`;

    window.location.href = `/decks/${deck.id}/game/?${gameOptions}`;
  }

  return (
    <Collapse in={collapse}>
      <div
        id={`collapse-deck-selection-${deck.id}`}
        className='deck-selection-expand mb-1'
        onClick={e => e.stopPropagation()}
      >
        <Button onClick={() => setEditModalOpen(true)} block>Edit</Button>
        <EditModal
          deck={deck}
          show={editModalOpen}
          close={() => setEditModalOpen(false)}
        />
        <Button href={`/deck/${deck.id}/flashcards/`} block>
          View
        </Button>
        <Button href={`/deck/${deck.id}/share/`} block>
          Share
        </Button>
        <hr />
        <Button onClick={() => setGameModalOpen(true)} block>Games</Button>
        <GameModal
          deck={deck}
          modalIsOpen={gameModalOpen}
          closeModal={() => setGameModalOpen(false)}
          submitHandler={gameSubmitHandler}
        />
        <Button href={`/decks/${deck.id}/stats/`} block>Statistics</Button>
        <Button onClick={() => setExportModalOpen(true)} block>Export</Button>
        <ExportModal
          deck={deck}
          modalIsOpen={exportModalOpen}
          closeModal={() => setExportModalOpen(false)}
        />
      </div>
    </Collapse>
  );
}

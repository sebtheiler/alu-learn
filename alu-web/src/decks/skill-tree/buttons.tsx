import React, { useState } from 'react';
import { Deck, CSSM } from '../types';
import { DeckEditCreateModal, ExportModal, GameModal } from '../buttons';
import { apiDeckEdit, apiSSMEdit, apiDeckDelete, apiSSMDelete } from '../../lookup';
import { errorHandler, has } from '../../utils';
import Button from 'react-bootstrap/Button';
import Collapse from 'react-bootstrap/Collapse';

interface DeckSelectionButtonsProps {
  deck: Deck | CSSM;
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

  const editSaveHandler = event => {
    event.preventDefault();
    const form = event.target;

    // If nothing has changed, prevent the user from saving
    if (
        deck.serializer_name === 'deck' &&
        form.elements.title.value === deck.title &&
        (form.elements.schedulingAlgo?.value ?? deck.scheduling_algorithm) === deck.scheduling_algorithm &&
        (form.elements.shuffleUnseenCards?.checked ?? deck.shuffle_unseen_cards) === deck.shuffle_unseen_cards &&
        parseInt(form.elements.dailyNewCardLimit.value) === deck.daily_new_card_limit &&
        parseInt(form.elements.dailySeenCardLimit.value) === deck.daily_seen_card_limit &&
        (parseInt(form.reviewAheadMinutes?.value ?? deck.review_ahead_minutes)) === deck.review_ahead_minutes &&
        form.elements.deckDifficulty.value === deck.difficulty
    ) {
      return;
    }

    // Tell the API to update the deck/CSSM
    if (deck.serializer_name === 'deck') {
      apiDeckEdit(
        deck.id,
        form.elements.title.value,
        form.elements.schedulingAlgo?.value,
        form.elements.shuffleUnseenCards?.checked,
        parseInt(form.elements.dailyNewCardLimit.value),
        parseInt(form.elements.dailySeenCardLimit.value),
        parseInt(form.elements.reviewAheadMinutes?.value),
        form.elements.deckDifficulty.value,
        (response, status) => {
          if (status === 200) {
            window.location.reload();
          } else {
            // Error updating deck
            errorHandler(response, status, 1000);
          }
      });
    } else if (deck.serializer_name === 'cssm' && has(deck, 'deck_ids')) {
      const deckSelectElement = form.elements.deckSelect;
      const selectedDecks = deckSelectElement ? Array.from(
        deckSelectElement.querySelectorAll("option:checked"),
        e => parseInt((e as HTMLOptionElement).value),
      ) : undefined;

      apiSSMEdit(
        deck.id,
        form.elements.title.value,
        form.elements.schedulingAlgo?.value,
        form.elements.shuffleUnseenCards?.checked,
        parseInt(form.dailyNewCardLimit.value),
        parseInt(form.dailySeenCardLimit.value),
        parseInt(form.reviewAheadMinutes?.value),
        selectedDecks,
        form.elements.tags?.value,
        form.elements.contains?.value,
        form.elements.isLeech?.value !== 'ANY' ? form.elements.isLeech?.value === 'LEECH' : null,
        form.elements.learningStatus?.value !== 'ANY' ? form.elements.learningStatus?.value : null,
        parseInt(form.elements.minEase?.value),
        parseInt(form.elements.maxEase?.value),
        (response, status) => {
          if (status === 200) {
            window.location.reload();
          } else {
            // Error updating CSSM
            errorHandler(response, status, 5003);
          }
        },
      );
    }
  }

  const editDeleteHandler = () => {
    if (deck.serializer_name === 'deck') {
      if (window.prompt(`
Are you sure you want to delete this deck?  This action is instant and irreversible.
If you wish to continue, please type "DELETE", without the quotes.
      `) === 'DELETE') {
        apiDeckDelete(deck.id, (response, status) => {
          if (status === 200) {
            window.location.href = '/home/decks/';
          } else {
            // Error deleting deck
            errorHandler(response, status, 1001);
          }
        });
      }
    } else {
      apiSSMDelete(deck.id, (response, status) => {
        if (status === 200) {
          window.location.href = '/home/decks/';
        } else {
          // Error deleting SSM
          errorHandler(response, status, 5004);
        }
      });
    }
  }

  return (
    <Collapse in={collapse}>
      <div id={`collapse-deck-selection-${deck.id}`} className='deck-selection-expand mb-1'>
        {/* TODO: make this work with CSSMs */}
        <Button href={`/decks/${deck.id}/flashcards/create/`} block>Add Cards</Button>
        <Button onClick={() => setEditModalOpen(true)} block>Edit</Button>
        <DeckEditCreateModal
          deck={deck}
          modalIsOpen={editModalOpen}
          closeModal={() => setEditModalOpen(false)}
          submitHandler={editSaveHandler}
          deleteHandler={editDeleteHandler}
        />
        <Button href={`/decks/${deck.id}/flashcards/`} block>Browse</Button>
        <hr />
        <Button onClick={() => setGameModalOpen(true)} block>Games</Button>
        <GameModal
          deck={deck}
          modalIsOpen={gameModalOpen}
          closeModal={() => setGameModalOpen(false)}
          submitHandler={gameSubmitHandler}
        />
        <Button href={`/decks/${deck.id}/stats/`} block>Statistics</Button>
        {deck.serializer_name === 'deck' && <>
          <Button onClick={() => setExportModalOpen(true)} block>Export</Button>
          <ExportModal
            deck={deck}
            modalIsOpen={exportModalOpen}
            closeModal={() => setExportModalOpen(false)}
          />
        </>}
      </div>
    </Collapse>
  );
}
import React, { useEffect, useState } from 'react';
import { AutoReader } from '../reader';
import { parseText } from '../autonote';
import { FlashCardCreate } from '../../../decks/flashcards';
import { apiDeckHome, apiNotePageDetail } from '../../../lookup';
import { errorHandler } from '../../../utils';
import '../reader.css';
import { Form } from 'react-bootstrap';

// TOOD: fix this function
export function AutoFlashCard(props) {
  const {noteId, pageNum} = props;
  const [text, setText] = useState(['Loading...']);
  const [selectedPar, setSelectedPar] = useState(0);
  const [note, setNote] = useState(null);
  const [noteDidSet, setNoteDidSet] = useState(false);
  const [decks, setDecks] = useState(null);
  const [decksDidSet, setDecksDidSet] = useState(false);
  const [selectedDeckId, setSelectedDeckId] = useState(0);

  useEffect(() => {
    if (noteDidSet === false) {
      setNoteDidSet(true);
      apiNotePageDetail(noteId, pageNum, (response, status) => {
        if (status === 200) {
          setNote(response);
          setText(parseText(response.content, 'json'));
        } else {
          // Error getting note detail in auto-flashcard
          errorHandler(response, status, 6003);
        }
      });
    }
  }, [noteId, note, noteDidSet, pageNum]);

  useEffect(() => {
    if (decksDidSet === false) {
      setDecksDidSet(true);
      apiDeckHome((response, status) => {
        if (status === 200) {
          setDecks(response.results.filter(
            deck => deck.serializer_name === 'deck'
          ).sort(deck => deck.title));
        } else {
          // Error getting list of decks for autoflashcard
          errorHandler(response, status, 1009);
        }
      });
    }
  }, [decksDidSet, decks]);

  const [percentComplete, setPercentComplete] = useState(0);
  const updateProgressBar = (newSelectedPar) => {
    const progressBar = document.getElementById('contentProgressBar');
    if (progressBar) {
      const newPercentComplete = Math.ceil(newSelectedPar / (text.length - 1) * 100);
      setPercentComplete(newPercentComplete);
      progressBar.style.width = Math.max(newPercentComplete, 4) + '%';
    }
  }


  return (<>
    <h1 className='text-center mt-5'>Turning Your Notes into Flashcards</h1>
    <AutoReader
      text={text}
      inputType='text'
      selectedPar={selectedPar}
      setSelectedPar={setSelectedPar}
      updateProgressBar={updateProgressBar}
      finished={false}
      compiledNotesButton={false}
    >
      <br />
      <FlashCardCreate deckId={selectedDeckId} />
      <div id='contentProgress' className='mt-1 mb-5'>
        <div id='contentProgressBar'>{percentComplete}%</div>
      </div>
      <br />
      <Form.Label>Flashcard Destination</Form.Label>
      <Form.Control
        as='select'
        name='sharingSetting'
        className='mb-5'
        onChange={event => {event.preventDefault(); setSelectedDeckId(parseInt(event.target.value))}}
        custom
      >
        {decks ? decks.map(deck => 
          <option value={deck.id} key={deck.id}>{deck.title}</option>
        ) :
          <option value='-1'>Loading...</option>
        }
      </Form.Control>
    </AutoReader>
  </>);
}
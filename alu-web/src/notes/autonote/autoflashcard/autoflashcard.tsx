import React, { useState } from 'react';
import { AutoReader } from '../reader';
import { parseText } from '../autonote';
import { apiDeckHome, apiNotePageDetail } from '../../../lookup';
import { useApiObjectHook } from '../../../utils';
import Form from 'react-bootstrap/Form';
import '../reader.css';
import { Deck } from '../../../decks/types';

export function AutoFlashCard({ noteId, pageNum }) {
  const [selectedPar, setSelectedPar] = useState(0);
  const [text] = useApiObjectHook<string[]>(
    apiNotePageDetail,
    200, 6003,
    [noteId, pageNum],
    null,
    response => parseText(response.content, 'json'),
  );
  const [decks] = useApiObjectHook<Deck[]>(
    apiDeckHome,
    200, 1009,
    [], null,
    response => response.results.filter(
      deck => deck.serializer_name === 'deck'
    ).sort(deck => deck.title),
  );
  const [selectedDeckId, setSelectedDeckId] = useState(0);
  const [percentComplete, setPercentComplete] = useState(0);

  const updateProgressBar = (newSelectedPar) => {
    const progressBar = document.getElementById('contentProgressBar');
    if (progressBar && text) {
      const newPercentComplete = Math.ceil(newSelectedPar / (text.length - 1) * 100);
      setPercentComplete(newPercentComplete);
      progressBar.style.width = Math.max(newPercentComplete, 4) + '%';
    }
  }


  return (<>
    <h1 className='text-center mt-5'>Turning Your Notes into Flashcards</h1>
    <AutoReader
      text={(text as string[]) || ['Loading...']}
      inputType='text'
      selectedPar={selectedPar}
      setSelectedPar={setSelectedPar}
      updateProgressBar={updateProgressBar}
      finished={false}
      compiledNotesButton={false}
    >
      <br />
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
        {decks ? (decks as Deck[]).map(deck => 
          <option value={deck.id} key={deck.id}>{deck.title}</option>
        ) :
          <option value='-1'>Loading...</option>
        }
      </Form.Control>
    </AutoReader>
  </>);
}
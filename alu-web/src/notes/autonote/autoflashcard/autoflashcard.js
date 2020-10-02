import React, { useEffect, useState } from 'react';
import {AutoReader} from '../reader';
import {parseText} from '../autonote';
import {FlashCardCreate} from '../../../decks/flashcards';
import { apiNoteDetail } from '../../../lookup';
import { errorHandler } from '../../../utils';
import '../reader.css';

export function AutoFlashCard(props) {
  const {noteId} = props;
  const [text, setText] = useState(['Loading...']);
  const [selectedPar, setSelectedPar] = useState(0);
  const [note, setNote] = useState(null);
  const [noteDidSet, setNoteDidSet] = useState(false);

  useEffect(() => {
    if (noteDidSet === false) {
      setNoteDidSet(true);
      apiNoteDetail(noteId, (response, status) => {
        if (status === 200) {
          setNote(response);
          setText(parseText(response.content, 'json'));
        } else {
          // Error getting note detail in auto-flashcard
          errorHandler(response, status, 6003);
        };
      });
    };
  }, [noteId, note, noteDidSet]);

  const [percentComplete, setPercentComplete] = useState(0);
  const updateProgressBar = (newSelectedPar) => {
    const progressBar = document.getElementById('contentProgressBar');
    if (progressBar) {
      const newPercentComplete = Math.ceil(newSelectedPar / (text.length - 1) * 100);
      setPercentComplete(newPercentComplete);
      progressBar.style.width = Math.max(newPercentComplete, 4) + '%';
    };
  };


  return (<>
    <h1 className='text-center'>Turning Your Notes into Flashcards</h1>
    <AutoReader
      text={text}
      selectedPar={selectedPar}
      setSelectedPar={setSelectedPar}
      updateProgressBar={updateProgressBar}
      finished={false}
      showCompiledNotes={false}
      setShowCompiledNotes={() => {}}
    >
      <FlashCardCreate deckId={1} />
      <div id='contentProgress' className='mt-1 mb-5'>
        <div id='contentProgressBar'>{percentComplete}%</div>
      </div>
    </AutoReader>
  </>);
};
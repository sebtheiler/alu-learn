import React, { useState } from 'react';
import {AutoReader} from '../reader';
import {FlashCardCreate} from '../../../decks/flashcards';
import '../reader.css';

export function AutoFlashCard(props) {
  // const {noteId} = props;
  const text = ['a', 'b', 'c'];
  const [selectedPar, setSelectedPar] = useState(0);

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
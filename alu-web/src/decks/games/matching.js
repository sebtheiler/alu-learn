import React, { useEffect, useState } from 'react';
import { Row, Col } from 'react-bootstrap';
import { apiGameFlashcards } from '../../lookup/lookup';
import { range, shuffle, errorHandler } from '../../utils';
// import { Node } from 'slate';
import './matching.css';

export function MatchingGame(props) {
  // TODO: get better flashcard choice, get interface to play, make pretty
  const {deckId} = props;
  const size = 4;
  const [numMissed, setNumMissed] = useState(0);
  const [correctlyGuessed, setCorrectlyGuessed] = useState([]);
  const [selectedBox, setSelectedBox] = useState([-1, -1]);
  const [flashcards, setFlashcards] = useState(null)
  const [flashcardsDidSet, setFlashcardsDidSet] = useState(false);

  useEffect(() => {
    if (!flashcardsDidSet) {
      setFlashcardsDidSet(true);
      apiGameFlashcards(parseInt(deckId), 'SEEN', size*size/2, false, (response, status) => {
        if (status === 200) {
          console.log(response)
          let randomOrder = [];
          for (const [i, flashcard] of response.entries()) {
            randomOrder.push([flashcard.deck_fields[0], i]);
            randomOrder.push([flashcard.deck_fields[1], i]);
          }
          randomOrder = shuffle(randomOrder);
          setFlashcards(randomOrder);
        } else {
          // Error getting flashcards for matching game
          errorHandler(response, status, 1027);
        }
      });
    }
  }, [flashcardsDidSet, flashcards, deckId]);

  const handleBoxClick = (rowNum, colNum) => {
    return event => {
      event.preventDefault();
      if (selectedBox[0] === rowNum && selectedBox[1] === colNum) {
        setSelectedBox([-1, -1]);
        return;
      } else {
        if (selectedBox[0] !== -1 && selectedBox[1] !== -1) {
          const currentBox = flashcards[selectedBox[0]*size + selectedBox[1]];
          const guessedBox = flashcards[rowNum*size + colNum];
          const correct = currentBox[1] === guessedBox[1];
          if (correct) {
            setCorrectlyGuessed([...correctlyGuessed, guessedBox[1]]);
          } else {
            setNumMissed(numMissed + 1);
          }
          setSelectedBox([-1, -1]);
          return;
        }
        if (!correctlyGuessed.includes(flashcards[rowNum*size + colNum][1])) {
          setSelectedBox([rowNum, colNum]);
        }
      }
    }
  }

  const getBoxClassName = (i, j) => {
    if (i === selectedBox[0] && j === selectedBox[1]) {
      return ' selected';
    } else if (correctlyGuessed.includes(flashcards[i*size + j][1])) {
      return ' correct';
    } else {
      return '';
    }
  }

  if (!flashcards) return null;
  return (<>
    <p>Missed: {numMissed}</p>
    {range(0, size).map(i => 
      <Row key={i} className='matching-row'>
        {range(0, size).map(j =>
          <Col
            key={j}
            className={'matching-col' + getBoxClassName(i, j)}
            onClick={getBoxClassName(i, j) === ' correct' ? null : handleBoxClick(i, j)}
          >
            <p>
              {flashcards[i*size + j][0].text[0].children[0].text}
              {/* {console.log(flashcards[i*size + j][0].text)} */}
              {/* {Node.string(flashcards[i*size + j][0].text)} */}
            </p>
          </Col>
        )}
      </Row>
    )}
  </>);
}

import React, { useMemo, useState } from 'react';
import { Row, Col, Button } from 'react-bootstrap';
import { range } from '../../utils';
import { RenderRichText, shuffle } from '../../utils';
import './matching.css';

export function MatchingGame(props) {
  const {size} = props;
  const flashcards = useMemo(() => {
    let randomOrder = [];
    for (const [i, flashcard] of props.flashcards.entries()) {
      randomOrder.push([flashcard.deck_fields[0], i]);
      randomOrder.push([flashcard.deck_fields[1], i]);
    }
    randomOrder = shuffle(randomOrder);
    return randomOrder;
  }, [props.flashcards]);
  const [numMissed, setNumMissed] = useState(0);
  const [correctlyGuessed, setCorrectlyGuessed] = useState([]);
  const [selectedBox, setSelectedBox] = useState([-1, -1]);

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
    {correctlyGuessed.length < flashcards.length/2 ? <>
      <p className='text-center'>Missed: {numMissed}</p>
      {range(0, size).map(i => 
        <Row key={i} className='matching-row'>
          {range(0, size).map(j =>
            <Col
              key={j}
              className={'matching-col' + getBoxClassName(i, j)}
              onClick={getBoxClassName(i, j) === ' correct' ? null : handleBoxClick(i, j)}
            >
              <RenderRichText
                text={flashcards[i*size + j][0].text}
              />
            </Col>
          )}
        </Row>
      )}
    </> : <div className='text-center'>
      <p>{numMissed ? `Congratulations, you've finished with only ${numMissed} miss${numMissed === 1 ? '' : 'es'}!` : 'Perfect Score! Congratulations!'}</p>
      <Button
        onClick={() => window.location.reload()}
        className='text-center mx-auto'
      >
        Play Again
      </Button>
    </div>}
  </>);
}

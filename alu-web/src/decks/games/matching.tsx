import React, { useMemo, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { range } from '../../utils';
import { RenderRichText, shuffle } from '../../utils';
import './matching.css';
import { ReviewInstance } from '../types';

interface MatchingProps {
  size: number;
  flashcards: ReviewInstance[];
}
export function MatchingGame(props: MatchingProps) {
  const {size, flashcards} = props;
  const randomizedFlashcards = useMemo(() => {
    let randomOrder = [] as any;
    // for (const [i, flashcard] of flashcards.entries()) {
    //   randomOrder.push([flashcard.fields[0], i]);
    //   randomOrder.push([flashcard.fields[1], i]);
    // }
    randomOrder = shuffle(randomOrder);
    return randomOrder;
  }, []);
  const [numMissed, setNumMissed] = useState<number>(0);
  const [correctlyGuessed, setCorrectlyGuessed] = useState([] as any);
  const [selectedBox, setSelectedBox] = useState<number[]>([-1, -1]);
  const [failedQuestions, setFailedQuestions] = useState([] as any);

  const handleBoxClick = (rowNum: number, colNum: number) => {
    return event => {
      event.preventDefault();
      if (selectedBox[0] === rowNum && selectedBox[1] === colNum) {
        setSelectedBox([-1, -1]);
        return;
      } else {
        if (selectedBox[0] !== -1 && selectedBox[1] !== -1) {
          const currentBox = randomizedFlashcards[selectedBox[0]*size + selectedBox[1]];
          const guessedBox = randomizedFlashcards[rowNum*size + colNum];
          const correct = currentBox[1] === guessedBox[1];
          if (correct) {
            setCorrectlyGuessed([...correctlyGuessed, guessedBox[1]]);
          } else {
            setNumMissed(numMissed + 1);
            let newFailedQuestions = failedQuestions;
            if (!failedQuestions.includes(flashcards[currentBox[1]])) {
              newFailedQuestions = [...newFailedQuestions, flashcards[currentBox[1]]];
            }
            if (!failedQuestions.includes(flashcards[guessedBox[1]])) {
              newFailedQuestions = [...newFailedQuestions, flashcards[guessedBox[1]]];
            }
            setFailedQuestions(newFailedQuestions);
          }
          setSelectedBox([-1, -1]);
          return;
        }
        if (!correctlyGuessed.includes(randomizedFlashcards[rowNum*size + colNum][1])) {
          setSelectedBox([rowNum, colNum]);
        }
      }
    }
  }

  const getBoxClassName = (i: number, j: number) => {
    if (i === selectedBox[0] && j === selectedBox[1]) {
      return ' matching-box-selected';
    } else if (correctlyGuessed.includes(randomizedFlashcards[i*size + j][1])) {
      return ' matching-box-correct';
    } else {
      return '';
    }
  }

  if (!randomizedFlashcards) return null;
  return (<>
    {correctlyGuessed.length < randomizedFlashcards.length/2 ? <>
      <p className='text-center'>Missed: {numMissed}</p>
      {range(0, size).map(i => 
        <Row key={i} className='matching-row'>
          {range(0, size).map(j =>
            <Col
              key={j}
              className={'matching-col' + getBoxClassName(i, j)}
              onClick={getBoxClassName(i, j) === ' matching-box-correct' ? undefined: handleBoxClick(i, j)}
            >
              <RenderRichText
                text={randomizedFlashcards[i*size + j][0]}
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
      {failedQuestions.length > 0 && <h3 className='mt-5'>Questions You Missed:</h3>}
      {failedQuestions.map((question, i) => (<React.Fragment key={i}>
        <hr />
        <RenderRichText text={question.fields[0]} />
        <RenderRichText text={question.fields[1]} />
      </React.Fragment>))}
    </div>}
  </>);
}

import React, {useEffect} from 'react';
import {getAnkiInterval} from './algorithm';
import {Button} from 'react-bootstrap';
import ReactMarkdown from 'react-markdown';
import RemarkMathPlugin from 'remark-math';
import {BlockMath, InlineMath} from 'react-katex';
import 'katex/dist/katex.min.css';

export function StudyElement(props) {
  const {currentCard, showAnswer, showAnswerHandler, backendGradeUpdate, handleKeyDown} = props;
  
  // Used for handling keypresses
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [showAnswer, handleKeyDown]);

  // Allows the buttons to use the same function
  // as is used when handling keypressess for 1,2,3,4
  const buttonIntervalWrapper = (grade) => {
    return () => {
      backendGradeUpdate(grade);
    };
  };

  const interval1 = getAnkiInterval(currentCard, 1)
  const interval2 = getAnkiInterval(currentCard, 2)
  const interval3 = getAnkiInterval(currentCard, 3)
  const interval4 = getAnkiInterval(currentCard, 4)

  return (
    <>
      <div className='col-md-12 text-center'style={{minWidth: '200px'}}>
        <ReactMarkdown
          source={currentCard ? currentCard.front_text : null}
          plugins={[RemarkMathPlugin]}
          renderers={{
            math: ({ value }) => <BlockMath>{value}</BlockMath>,
            inlineMath: ({ value }) => <InlineMath>{value}</InlineMath>
          }}
        />
      </div>
      <hr />
      <div className='col-md-12 text-center' style={{minWidth: '200px'}}>
        <ReactMarkdown
          source={currentCard && showAnswer ? currentCard.back_text : ''}
          plugins={[RemarkMathPlugin]}
          renderers={{
            math: ({ value }) => <BlockMath>{value}</BlockMath>,
            inlineMath: ({ value }) => <InlineMath>{value}</InlineMath>
          }}
        />
      </div>
      <footer className='fixed-bottom mb-5'>
        <div className='mb-5'>
          <div className={'col-md-12 text-center btn-group mb-5' + (showAnswer ? ' d-none' : '')}>
              <Button onClick={showAnswerHandler}>Show Answer</Button>
          </div>
          <div className={'col-md-12 text-center btn-group mb-5' + (!showAnswer ? ' d-none' : '')}>
            <Button
              onClick={buttonIntervalWrapper(1)}
              className={'mx-1' + (interval1.interval === -1 ? ' d-none' : '')}
              variant='danger'
            >
              Again {interval1.interval.toString() + (interval1.isMinute ? 'm' : 'd')}
            </Button>
            <Button
              onClick={buttonIntervalWrapper(2)}
              className={'mx-1' + (interval2.interval === -1 ? ' d-none' : '')}
              variant='warning'
            >
              Hard {interval2.interval.toString() + (interval2.isMinute ? 'm' : 'd')}
            </Button>
            <Button
              onClick={buttonIntervalWrapper(3)}
              className={'mx-1' + (interval3.interval === -1 ? ' d-none' : '')}
              variant='success'
            >
              Good {interval3.interval.toString() + (interval3.isMinute ? 'm' : 'd')}
            </Button>
            <Button
              onClick={buttonIntervalWrapper(4)}
              className={'mx-1' + (interval4.interval === -1 ? ' d-none' : '')}
              variant='primary'
            >
              Easy {interval4.interval.toString() + (interval4.isMinute ? 'm' : 'd')}
            </Button>
          </div>
        </div>
      </footer>
    </>
  );
};
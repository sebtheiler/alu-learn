import React, { useEffect, useState } from 'react';
import Container from 'react-bootstrap/Container';
import { RenderRichText } from '../../../utils';
import { ReviewInstance } from '../../types';
import './flashcard.scss';

export function ReviewInstanceStudy(props: { reviewInstance: ReviewInstance }) {
  const { reviewInstance } = props;
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    const keyUp = event => event.code === 'Space' ? setIsFlipped(!isFlipped) : null;
    document.addEventListener('keyup', keyUp);
    return () => document.removeEventListener('keyup', keyUp);
  }, [isFlipped]);

  return (
    <Container>
      <div
        className={'flip' + (isFlipped ? ' is-flipped' : '')}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div className='card front' onMouseOver={() => console.log('fuck')}>
          <RenderRichText
            text={reviewInstance.flashcard_fields ? reviewInstance.flashcard_fields[0] : []}
            fixSlateLazy
          />
        </div>
        <div className='card back' onMouseOver={() => console.log('you')}>
          <RenderRichText
            text={reviewInstance.flashcard_fields ? reviewInstance.flashcard_fields[1] : []}
            fixSlateLazy
          />
        </div>
      </div>
      <div className='text-secondary text-center'>
        <small>Click the card, or press space, to reveal the other side</small>
      </div>
    </Container>
  );
}
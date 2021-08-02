import React, { useMemo } from 'react';
import { ReviewInstance } from '../../types';
import { ReviewInstanceStudy } from './flashcard';
import { OutroSlides } from './outro-slides';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import './review-instances.scss';

const EASE_FOR_HARD_EXERCISE = 210;  // TODO: update with real data
export function StudyReviewInstances(props: { reviewInstances: ReviewInstance[] }) {
  // const { reviewInstances } = props;
  const reviewInstances: ReviewInstance[] =[];
  const originalInfo = useMemo(
    () => ({
      numTotal: reviewInstances.length,
      numNew: reviewInstances.filter(ri => ri.learning_status === 'UNSEEN').length,
    }),
    // eslint-disable-next-line
    [],
  );

  return (
    <Container>
      {reviewInstances.length > 0 && <div>
        <div>
          <div className='study-progress mt-3'>
            <div
              className='study-progress-bar'
              style={{ width: `${Math.floor(
                (1 - reviewInstances.length/originalInfo.numTotal) * 100
              )}%` }}
            />
          </div>
          <p className={
            'hard-exercise-text my-2' +
            (reviewInstances[0].ease <= EASE_FOR_HARD_EXERCISE ? ' show' : '')
          }>
            This flashcard is tough!  Good luck!
          </p>
        </div>
        <ReviewInstanceStudy reviewInstance={reviewInstances[0]} />
      </div>}
      {reviewInstances.length === 0 && <div className='text-center'>
        <h1>Congratulations!</h1>
        <Row>
          <Col md={6} xs={12} className='finished-col left'>
            <OutroSlides originalInfo={originalInfo} />
          </Col>
          <Col md={6} xs={12} className='finished-col right'>
            {originalInfo.numNew > 0 && <p className='text-success'>
              You learned <strong>{originalInfo.numNew}</strong> flashcards!
            </p>}
            <p className='text-primary'>
              You refreshed your knowledge of{' '}
              <strong>{originalInfo.numTotal - originalInfo.numNew}</strong>
              {' '}flashcards!
            </p>
            <p>TODO: AD</p>
          </Col>
        </Row>
      </div>}
    </Container>
  );
}
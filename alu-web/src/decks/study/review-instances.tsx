import AdComponent from '../../pages/ads';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Col from 'react-bootstrap/Col';
import Confetti from 'react-confetti';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import { OutroSlides } from './outro-slides';
import { QuestionBubble } from '../../utils';
import { ReviewInstance } from '../types';
import { ReviewInstanceStudy } from './flashcard';
import { apiStreakReviewInfo, StreakInfo, useAsyncDispatch } from '../../lookup/lookup';
import { useMemo } from 'react';
import './review-instances.scss';
import ProgressBar from '../../utils/ProgressBar';

const EASE_FOR_HARD_EXERCISE = 210;  // TODO: update with real data

interface OriginalInfo {
  numTotal: number;
  numNew: number;
  reviewInfo: StreakInfo | undefined;
}

interface StudyReviewInstancesProps {
  reviewInstances: ReviewInstance[];
  numTotal: number;
  deckId: number;
  section: string;
  studyAhead: boolean;
  isPro: boolean;
}
export function StudyReviewInstances({ reviewInstances, numTotal, deckId, section, studyAhead, isPro }: StudyReviewInstancesProps) {
  const [originalReviewInfo] = useAsyncDispatch<StreakInfo>(apiStreakReviewInfo);
  const originalInfo = useMemo<OriginalInfo>(
    () => ({
      numTotal: reviewInstances.length,
      numNew: reviewInstances.filter(ri => ri.learning_status === 'UNSEEN').length,
      reviewInfo: originalReviewInfo,
    }),

    // We don't want to re-update this information when `reviewInstances` changes
    // eslint-disable-next-line
    [originalReviewInfo],
  );

  return (
    <Container style={{ maxHeight: '70vh' }}>
      <div>
        <br />
        <ProgressBar
          stepNum={originalInfo.numTotal - reviewInstances.length}
          totalNumSteps={originalInfo.numTotal}
        />
        <p className={
          'hard-exercise-text my-2' +
          (reviewInstances[0]?.ease <= EASE_FOR_HARD_EXERCISE ? ' show' : '')
        }>
          This flashcard is tough!  Good luck!
        </p>
      </div>
      {reviewInstances.length > 0 && <div style={{ maxHeight: '70vh' }}>
        <ReviewInstanceStudy
          reviewInstance={reviewInstances[0]}
          deckId={deckId}
          section={section}
          studyAhead={studyAhead}
        />
        <Button
          href={`/deck/${deckId}/flashcards/${reviewInstances[0].flashcard}/edit/`}
          target='_blank'
          className='float-right'
          variant='secondary'
        >
          Edit
        </Button>
      </div>}
      {reviewInstances.length === 0 &&
        <FinishedStudying
          originalInfo={originalInfo}
          numTotal={numTotal}
          section={section}
          deckId={deckId}
          isPro={isPro}
        />
      }
    </Container>
  );
}

interface FinishedStudyingProps {
  originalInfo: OriginalInfo;
  numTotal: number;
  section: string;
  deckId: number;
  isPro: boolean;
}
function FinishedStudying({ originalInfo, numTotal, section, deckId, isPro }: FinishedStudyingProps) {
  if (numTotal === 0) {
    return (
      <div className='text-center'>
        <p>This section doesn't have any flashcards yet</p>
        <Button href={`/deck/${deckId}/flashcards/create/` + (section ? `${section}/` : '')}>
          Add Flashcards
        </Button>
      </div>
    );
  } else if (numTotal > 0 && originalInfo.numTotal === 0) {
    return (
      <div className='text-center'>
        <p>You've fully completed this section!</p>
        <ButtonGroup>
          <Button
            href={`${window.location.href}?studyAhead=true`}
            style={{ width: '150px' }}
            className='mr-1'
          >
            Study Ahead{' '}
            <QuestionBubble isWhite>
              By default, Alu will show you flashcards right before you forget them.
              If you would like to study extra, you can click this button.
              (this won't change the review dates of the flashcards, nor will it give you extra progress.)
            </QuestionBubble>
          </Button>
          <Button
            href={`/deck/${deckId}/`}
            variant='secondary'
            style={{ width: '150px' }}
          >
            Exit
          </Button>
        </ButtonGroup>
      </div>
    );
  } else {
    return (
      <div className='text-center'>
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={300}
          tweenDuration={20000}
        />
        <h1>Congratulations!</h1>
        <Row>
          <Col md={6} xs={12} className='finished-col left'>
            <OutroSlides originalInfo={originalInfo} deckId={deckId} />
          </Col>
          <Col md={6} xs={12} className='finished-col right'>
            {originalInfo.numNew > 0 && <p className='text-success'>
              You learned <strong>{originalInfo.numNew}</strong> flashcards!
            </p>}
            {originalInfo.numTotal > originalInfo.numNew && <p className='text-primary'>
              You refreshed your knowledge of <strong>{originalInfo.numTotal - originalInfo.numNew}</strong> flashcards!
            </p>}
            <AdComponent adType='finished-studying' isPro={isPro} />
          </Col>
        </Row>
      </div>
    );
  }
}

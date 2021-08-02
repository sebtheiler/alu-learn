import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Row from 'react-bootstrap/Row';
import { apiStreakReviewInfo, useAsyncDispatch, StreakInfo } from '../../../lookup/lookup';
import CardsDoneSVG from './cards-done-svg';
import './outro-slides.scss';


interface OutroSlidesProps {
  originalInfo: {
    numTotal: number;
    numNew: number;
  };
}
export function OutroSlides(props: OutroSlidesProps) {
  const { originalInfo } = props;
  // const reviewInfo = { streak: 21, cards_done: 50, target_cards_done: 75 };
  const [reviewInfo] = useAsyncDispatch<StreakInfo>(apiStreakReviewInfo);
  console.log(reviewInfo)
  const [outroSlideNum, setOutroSlideNum] = useState(0);

  const outroSlides = reviewInfo ? [
    (<Row style={{ height: '270px' }}>
      <h4 className='text-center mx-auto mb-5' style={{ height: '50px' }}>Streak Increase!</h4>
      <div className='streak unlit'>
        <i className='fas fa-fire-alt fa-10x' />
        <span className='streak-number'>
          {reviewInfo.streak - 1}
        </span>
      </div>
      <div className='streak lit'>
        <i className='fas fa-fire-alt fa-10x' />
        <span
          className='streak-number'
          style={{
          }}
        >
          {reviewInfo.streak}
        </span>
      </div>
      <p className='text-center mx-auto streak-text' style={{ transform: 'translateY(60px)' }}>
        You're on a roll!  Don't forget to study tomorrow or your streak will reset!
      </p>
    </Row>),
    (<>
      {
      reviewInfo.cards_done <= reviewInfo.target_cards_done/2 && <>
        <h4 className='text-center mx-auto'>
          Great Start!
        </h4>
        <CardsDoneSVG
          targetCardsDone={reviewInfo.target_cards_done}
          cardsDone={reviewInfo.cards_done}
          cardsJustDone={originalInfo.numTotal}
        />
        <p className='text-center mx-auto'>
          Keep working towards your daily goal!
        </p>
      </>}
      {
      reviewInfo.cards_done > reviewInfo.target_cards_done/2 &&
      reviewInfo.cards_done < reviewInfo.target_cards_done && <>
        <h4 className='text-center mx-auto'>
          Almost There!
        </h4>
        <CardsDoneSVG
          targetCardsDone={reviewInfo.target_cards_done}
          cardsDone={reviewInfo.cards_done}
          cardsJustDone={originalInfo.numTotal}
        />
        <p className='text-center mx-auto'>
          Keep working towards your daily goal!
        </p>
      </>}
      {
      reviewInfo.cards_done >= reviewInfo.target_cards_done &&
      reviewInfo.cards_done - originalInfo.numTotal < reviewInfo.target_cards_done && <>
        <h4 className='text-center mx-auto'>
          Daily Goal Reached!
        </h4>
        <CardsDoneSVG
          targetCardsDone={reviewInfo.target_cards_done}
          cardsDone={reviewInfo.cards_done}
          cardsJustDone={originalInfo.numTotal}
        />
        <p className='text-center mx-auto'>
          Congratulations on reaching your daily goal!
        </p>
      </>}
      {
      reviewInfo.cards_done >= reviewInfo.target_cards_done &&
      reviewInfo.cards_done - originalInfo.numTotal >= reviewInfo.target_cards_done && <>
        <h4 className='text-center mx-auto'>
          Keep Going!
        </h4>
        <CardsDoneSVG
          targetCardsDone={reviewInfo.target_cards_done}
          cardsDone={reviewInfo.cards_done}
          cardsJustDone={originalInfo.numTotal}
        />
        <p className='text-center mx-auto'>
          Nice work on exceeding your daily goal!
        </p>
      </>}
    </>),
    (<>
      <h4>What Next?</h4>
      <ButtonGroup className='w-100 mt-3'>
        <Button
          onClick={() => window.location.reload()}
          className='mr-1 w-50'
          autoFocus
        >
          Study Again
        </Button>
        <Button
          href='TODO: deck page'
          variant='secondary'
          className='w-50'
        >
          Exit
        </Button>
      </ButtonGroup>
      <small className='text-secondary'>Use tab and space to select</small>
    </>),
  ] : [<p>Loading...</p>];

  return (<>
    {outroSlides[outroSlideNum]}
    {outroSlideNum < outroSlides.length - 1 && <Button
      className='mx-auto'
      onClick={() => setOutroSlideNum(outroSlideNum + 1)}
      autoFocus
    >
      Next (space)
    </Button>}
  </>);
}

import CardsDoneSVG from './study/cards-done-svg'
import AdComponent from '../pages/ads';
import { apiStreakReviewInfo, useAsyncDispatch, StreakInfo } from '../lookup/lookup';

export default function Meta({ isTeacher }: { isTeacher: boolean }) {
  const [reviewInfo] = useAsyncDispatch<StreakInfo>(apiStreakReviewInfo);

  return (<>
    {!isTeacher && <>
      <CardsDoneSVG
        targetCardsDone={reviewInfo?.target_num_cards ?? 0}
        cardsDone={reviewInfo?.cards_done ?? 0}
        cardsJustDone={0}
      />
      <small className='text-secondary'>You can change this goal in the <a href='/settings'>settings</a></small>
    </>}
    <hr style={{ maxWidth: '300px' }} />
    <AdComponent adType='meta-sidebar' />
  </>)
}


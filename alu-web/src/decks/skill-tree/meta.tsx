import CardsDoneSVG from './study/cards-done-svg'
import { apiStreakReviewInfo, useAsyncDispatch, StreakInfo } from '../../lookup/lookup';

export default function Meta() {
  const [reviewInfo] = useAsyncDispatch<StreakInfo>(apiStreakReviewInfo);

  return (<>
    <CardsDoneSVG
      targetCardsDone={reviewInfo?.target_cards_done ?? 0}
      cardsDone={reviewInfo?.cards_done ?? 0}
      cardsJustDone={0}
    />
    <p>AD</p>
  </>)
}
import { dateDiff } from '../../../utils';
import { Interval } from '../../study/algorithm';
import { REVIEW_AHEAD_MINUTES } from './context';

export function getMinNum(interval: Interval): number {
  const rawMinutes = dateDiff(interval.last_review, interval.next_review, 1000*60);
  return rawMinutes > REVIEW_AHEAD_MINUTES ? Math.max(rawMinutes, 1440) : rawMinutes;
}

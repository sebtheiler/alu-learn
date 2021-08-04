import { dateDiff } from '../../../utils';
import { Interval } from '../../study/algorithm';

export function getMinNum(interval: Interval): number {
  return dateDiff(interval.last_review, interval.next_review, 1000*60);
}

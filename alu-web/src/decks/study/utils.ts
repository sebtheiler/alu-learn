import { Interval } from './algorithm';
import { REVIEW_AHEAD_MINUTES } from './context';
import { dateDiff } from '../../utils';

export function getMinNum(interval: Interval): number {
  const rawMinutes = dateDiff(interval.last_review, interval.next_review, 1000*60);
  const differentDay = new Date(interval.next_review).getDate() !== new Date().getDate();
  return (rawMinutes > REVIEW_AHEAD_MINUTES || differentDay) ? Math.max(rawMinutes, 1440) : rawMinutes;
}

export function replaceQueryParam(param: string, newval: string, search: string) {
  const regex = new RegExp("([?;&])" + param + "[^&;]*[;&]?");
  const query = search.replace(regex, "$1").replace(/&$/, '');

  return (query.length > 2 ? query + "&" : "?") + (newval ? param + "=" + newval : '');
}

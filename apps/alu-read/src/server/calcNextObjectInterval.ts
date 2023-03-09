// import daysBetween from "helpers-lib/src/daysBetween";
// import type { MergedObject } from "../../types";
function treatAsUTC(date: Date | string) {
  const result = new Date(date);
  result.setMinutes(result.getMinutes() - result.getTimezoneOffset());
  return result;
}

/**
 * Gets the number of days between two dates
 * @param startDate Earlier date
 * @param endDate Later date
 * @returns Number of days between the two dates
 */
function daysBetween(startDate: Date | string, endDate: Date | string) {
  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  return (
    (treatAsUTC(endDate).valueOf() - treatAsUTC(startDate).valueOf()) /
    millisecondsPerDay
  );
}

const calcNextObjectInterval = (object: any): number => {
  const previousInterval = object.lastReview
    ? daysBetween(object.lastReview, new Date())
    : 0;
  const nextInterval = Math.max(previousInterval, 1) * object.aFactor;

  return nextInterval;
};

export default calcNextObjectInterval;

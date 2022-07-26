// Adapted from https://stackoverflow.com/a/11252167/10226703

/**
 * Treats a date as if it were in UTC
 */
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
export default function daysBetween(
  startDate: Date | string,
  endDate: Date | string
) {
  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  return (
    (treatAsUTC(endDate).valueOf() - treatAsUTC(startDate).valueOf()) /
    millisecondsPerDay
  );
}

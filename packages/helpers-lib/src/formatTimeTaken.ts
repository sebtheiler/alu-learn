import formatPlural from "./formatPlural";

/**
 * Formats time in ms to display as seconds or minutes
 * @param timeTaken Milliseconds
 * @returns The formatted time
 */
const formatTimeTaken = (timeTaken: number) =>
  timeTaken / 1000 < 60
    ? formatPlural(Math.round(timeTaken / 1000), "second")
    : formatPlural(Math.round(timeTaken / 1000 / 60), "minute");

export default formatTimeTaken;

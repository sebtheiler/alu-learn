import formatPlural from "./formatPlural";

const formatTimeTaken = (timeTaken: number) =>
  timeTaken / 1000 < 60
    ? formatPlural(Math.round(timeTaken / 1000), "second")
    : formatPlural(Math.round(timeTaken / 1000 / 60), "minute");

export default formatTimeTaken;

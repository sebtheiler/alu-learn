import daysBetween from "helpers-lib/src/daysBetween";
import type { MergedObject } from "../../types";

const calcNextObjectInterval = (object: MergedObject): number => {
  const previousInterval = object.lastReview
    ? daysBetween(object.lastReview, new Date())
    : 0;
  const nextInterval = Math.max(previousInterval, 1) * object.aFactor;

  return nextInterval;
};

export default calcNextObjectInterval;

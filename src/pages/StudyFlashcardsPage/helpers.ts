const EASE_FOR_HARD_EXERCISE = 180;

const GRADES: Grade[] = ["AGAIN", "HARD", "GOOD", "EASY"];

const TIME_BEFORE_SWAP = 250;

type Grade = "AGAIN" | "HARD" | "GOOD" | "EASY";

/**
 * Formats an interval's minutes into a readable format (25 => 25m; 2880 => 2d)
 * @param minutes Number of minutes in the interval
 * @returns The formatted date (minutes, days, or months)
 */
const formatDate = (minutes: number | undefined): string => {
  if (typeof minutes !== "number") return "";
  if (minutes >= 1000) {
    // slightly less than 1440 (1 day) for weird edge cases when pressing "again"
    if (minutes / 1440 > 30) {
      return `${Math.round((minutes / 1440 / 30) * 10) / 10}mo`;
    }
    return `${Math.round(minutes / 1440)}d`;
  }
  return `${Math.round(minutes)}m`;
};

export type { Grade };
export { EASE_FOR_HARD_EXERCISE, GRADES, TIME_BEFORE_SWAP, formatDate };
